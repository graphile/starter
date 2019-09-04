import { mapValues } from "lodash";
import { Pool, PoolClient } from "pg";

type User = { id: number };

const pools = {};
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
if (!TEST_DATABASE_URL) {
  throw new Error("Cannot run tests without a TEST_DATABASE_URL");
}

// Make sure we release those pgPools so that our tests exit!
afterAll(() => {
  const keys = Object.keys(pools);
  return Promise.all(
    keys.map(async key => {
      try {
        const pool = pools[key];
        delete pools[key];
        await pool.end();
      } catch (e) {
        console.error("Failed to release connection!");
        console.error(e);
      }
    })
  );
});

/******************************************************************************/

type ClientCallback<T = any> = (client: PoolClient) => Promise<T>;

const poolFromUrl = (url: string) => {
  if (!pools[url]) {
    pools[url] = new Pool({ connectionString: url });
  }
  return pools[url];
};

const withDbFromUrl = async <T>(url: string, fn: ClientCallback<T>) => {
  const pool = poolFromUrl(url);
  const client = await pool.connect();
  await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE;");

  try {
    await fn(client);
  } catch (e) {
    // Error logging can be helpful:
    if (typeof e.code === "string" && e.code.match(/^[0-9A-Z]{5}$/)) {
      console.error([e.message, e.code, e.detail, e.hint, e.where].join("\n"));
    }
    throw e;
  } finally {
    await client.query("ROLLBACK;");
    await client.query("RESET ALL;"); // Shouldn't be necessary, but just in case...
    await client.release();
  }
};

export const withRootDb = <T>(fn: ClientCallback<T>) =>
  withDbFromUrl(TEST_DATABASE_URL, fn);

export const withUserDb = <T>(
  fn: (client: PoolClient, user: User) => Promise<T>
) =>
  withRootDb(async client => {
    const [user] = await createUsers(client, 1);
    await becomeUser(client, user.id);
    await fn(client, user);
  });

export const becomeRoot = (client: PoolClient) => client.query("reset role");
export const becomeUser = (
  client: PoolClient,
  userOrUserId: User | number | null
) =>
  client.query(
    `
      with new_session as (
        insert into app_private.sessions (user_id)
        select * from (values($2::int)) v
        where $2 is not null
        returning *
      )
      select set_config('role', $1, true), set_config('jwt.claims.session_id', coalesce((select uuid::text from new_session), ''), true)
    `,
    [
      process.env.DATABASE_VISITOR,
      userOrUserId
        ? typeof userOrUserId === "object"
          ? userOrUserId.id
          : userOrUserId
        : null,
    ]
  );

/* Quickly becomes root, does the thing, and then reverts back to previous role */
export const asRoot = async <T>(
  client: PoolClient,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const {
    rows: [{ role }],
  } = await client.query("select current_setting('role') as role");
  await client.query("reset role");
  try {
    return await callback(client);
  } finally {
    await client.query("select set_config('role', $1, true)", [role]);
  }
};

export const getSessions = async (client: PoolClient, userId: number) => {
  const { rows } = await asRoot(client, () =>
    client.query(`select * from app_private.sessions where user_id = $1`, [
      userId,
    ])
  );
  return rows;
};

/******************************************************************************/

// Enables multiple calls to `createUsers` within the same test to still have
// deterministic results without conflicts.
let userCreationCounter = 0;
beforeEach(() => {
  userCreationCounter = 0;
});

export const createUsers = async function createUsers(
  client: PoolClient,
  count: number = 1,
  verified: boolean = true
) {
  const users = [];
  if (userCreationCounter > 25) {
    throw new Error("Too many users created!");
  }
  const userLetter = "abcdefghijklmnopqrstuvwxyz"[userCreationCounter];
  for (let i = 0; i < count; i++) {
    let {
      rows: [user],
    } = await client.query(
      `SELECT * FROM app_private.really_create_user(
        username := $1,
        email := $2,
        email_is_verified := $3,
        name := $4,
        avatar_url := $5,
        password := $6
      )`,
      [
        `user_${userLetter}`,
        `${userLetter}${i || ""}@b.c`,
        verified,
        `User ${userLetter}`,
        null,
        userLetter.repeat(12),
      ]
    );
    expect(user.id).not.toBeNull();
    users.push(user);
  }
  userCreationCounter++;
  return users;
};

/******************************************************************************/

export const pruneDates = (row: { [key: string]: unknown }) =>
  mapValues(row, (v, k) => {
    if (!v) {
      return v;
    }
    if (v instanceof Date) {
      return "[DATE]";
    } else if (
      typeof v === "string" &&
      k.match(/(_at|At)$/) &&
      v.match(/^20[0-9]{2}-[0-9]{2}-[0-9]{2}/)
    ) {
      return "[DATE]";
    }
    return v;
  });

const idReplacement = (v: string | number | null) => (!v ? v : "[ID]");
export const pruneIds = (row: { [key: string]: unknown }) =>
  mapValues(row, (v, k) =>
    (k === "id" || k.endsWith("Id")) &&
    (typeof v === "string" || typeof v === "number")
      ? idReplacement(v)
      : v
  );
export const pruneUUIDs = (row: { [key: string]: unknown }) =>
  mapValues(row, (v, k) =>
    k === "queue_name" &&
    typeof v === "string" &&
    v.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ? "[UUID]"
      : k === "gravatar" && typeof v === "string" && v.match(/^[0-9a-f]{32}$/i)
      ? "[gUUID]"
      : v
  );

export const snapshotSafe = (obj: { [key: string]: unknown }) =>
  pruneIds(pruneDates(obj));

export const deepSnapshotSafe = (obj: { [key: string]: unknown }): any => {
  if (Array.isArray(obj)) {
    return obj.map(deepSnapshotSafe);
  } else if (obj && typeof obj === "object") {
    return mapValues(pruneUUIDs(pruneIds(pruneDates(obj))), deepSnapshotSafe);
  }
  return obj;
};
/******************************************************************************/

export const deleteTestUsers = () => {
  // We're not using withRootDb because we don't want the transaction rolled back
  const pool = poolFromUrl(TEST_DATABASE_URL);
  return pool.query(
    `
      delete from app_public.users
      where username like 'testuser%'
      or username = 'testuser'
      or id in
        (
          select user_id from app_public.user_emails where email like 'testuser%@example.com'
        union
          select user_id from app_public.user_authentications where service = 'facebook' and identifier = '123456%'
        )
      `
  );
};

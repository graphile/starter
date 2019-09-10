import { mapValues } from "lodash";
import { PoolClient } from "pg";
import {
  TEST_DATABASE_URL,
  poolFromUrl,
  deleteTestData,
  asRoot,
} from "../../__tests__/helpers";

// We need to inform jest that these files depend on changes to the database, so
// we write a dummy file after current.sql is imported
import { ts } from "./.jest.watch.hack.json";
ts; // We used it... see?

export * from "../../__tests__/helpers";

beforeAll(deleteTestData);

type User = { id: number; _password?: string; _email?: string };

/******************************************************************************/

type ClientCallback<T = any> = (client: PoolClient) => Promise<T>;

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

export const withAnonymousDb = <T>(fn: (client: PoolClient) => Promise<T>) =>
  withRootDb(async client => {
    await becomeUser(client, null);
    await fn(client);
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
    const password = userLetter.repeat(12);
    const email = `${userLetter}${i || ""}@b.c`;
    const user: User = (await client.query(
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
        email,
        verified,
        `User ${userLetter}`,
        null,
        password,
      ]
    )).rows[0];
    expect(user.id).not.toBeNull();
    user._email = email;
    user._password = password;
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
    (k === "id" || k.endsWith("_id")) &&
    (typeof v === "string" || typeof v === "number")
      ? idReplacement(v)
      : v
  );

const uuidRegexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const pruneUUIDs = (row: { [key: string]: unknown }) =>
  mapValues(row, (v, k) => {
    if (typeof v !== "string") {
      return v;
    }
    const val = v;
    return ["uuid", "queue_name"].includes(k) && v.match(uuidRegexp)
      ? "[UUID]"
      : k === "gravatar" && val.match(/^[0-9a-f]{32}$/i)
      ? "[gUUID]"
      : v;
  });

export const pruneHashes = (row: { [key: string]: unknown }) =>
  mapValues(row, (v, k) =>
    k.endsWith("_hash") && typeof v === "string" && v[0] === "$" ? "[hash]" : v
  );

export const snapshotSafe = (obj: { [key: string]: unknown }) =>
  pruneHashes(pruneUUIDs(pruneIds(pruneDates(obj))));

export const deepSnapshotSafe = (obj: { [key: string]: unknown }): any => {
  if (Array.isArray(obj)) {
    return obj.map(deepSnapshotSafe);
  } else if (obj && typeof obj === "object") {
    return mapValues(
      pruneHashes(pruneUUIDs(pruneIds(pruneDates(obj)))),
      deepSnapshotSafe
    );
  }
  return obj;
};
/******************************************************************************/

export const clearJobs = async (client: PoolClient) => {
  await asRoot(client, () => client.query("delete from graphile_worker.jobs"));
};

export const getJobs = async (
  client: PoolClient,
  taskIdentifier: string | null = null
) => {
  const { rows } = await asRoot(client, () =>
    client.query(
      "select * from graphile_worker.jobs where $1::text is null or task_identifier = $1::text",
      [taskIdentifier]
    )
  );
  return rows;
};

import { Pool, PoolClient } from "pg";

const pools = {};

if (!process.env.TEST_DATABASE_URL) {
  throw new Error("Cannot run tests without a TEST_DATABASE_URL");
}
export const TEST_DATABASE_URL: string = process.env.TEST_DATABASE_URL;

export type User = {
  id: string;
  username: string;
  _password?: string;
  _email?: string;
};
export type Organization = { id: string; name: string };

// Make sure we release those pgPools so that our tests exit!
afterAll(() => {
  const keys = Object.keys(pools);
  return Promise.all(
    keys.map(async (key) => {
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

export const poolFromUrl = (url: string) => {
  if (!pools[url]) {
    pools[url] = new Pool({ connectionString: url });
  }
  return pools[url];
};

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

export const deleteTestData = async () => {
  await deleteTestUsers();
};

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
    try {
      await client.query("select set_config('role', $1, true)", [role]);
    } catch (e) {
      // Transaction was probably aborted, don't clobber the error
    }
  }
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
  for (let i = 0; i < count; i++) {
    const userLetter = "abcdefghijklmnopqrstuvwxyz"[userCreationCounter];
    userCreationCounter++;
    const password = userLetter.repeat(12);
    const email = `${userLetter}${i || ""}@b.c`;
    const user: User = (
      await client.query(
        `SELECT * FROM app_private.really_create_user(
        username := $1,
        email := $2,
        email_is_verified := $3,
        name := $4,
        avatar_url := $5,
        password := $6
      )`,
        [
          `testuser_${userLetter}`,
          email,
          verified,
          `User ${userLetter}`,
          null,
          password,
        ]
      )
    ).rows[0];
    expect(user.id).not.toBeNull();
    user._email = email;
    user._password = password;
    users.push(user);
  }
  return users;
};

export const createOrganizations = async function createOrganizations(
  client: PoolClient,
  count: number = 1
) {
  const organizations: Organization[] = [];
  for (let i = 0; i < count; i++) {
    const slug = `organization-${i}`;
    const name = `Organization ${i}`;
    const {
      rows: [organization],
    } = await client.query(
      `
        select * from app_public.create_organization($1, $2)
      `,
      [slug, name]
    );
    organizations.push(organization);
  }

  return organizations;
};

/******************************************************************************/

export const createSession = async (
  client: PoolClient,
  userId: string
): Promise<{ uuid: string }> => {
  const {
    rows: [session],
  } = await client.query(
    `
      insert into app_private.sessions (user_id)
      values ($1::uuid)
      returning *
    `,
    [userId]
  );
  return session;
};

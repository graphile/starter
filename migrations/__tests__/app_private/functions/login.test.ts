import { withRootDb, snapshotSafe } from "../../helpers";
import { PoolClient } from "pg";
import { reallyCreateUser } from "./really_create_user.test";

async function login(
  client: PoolClient,
  username: string | null,
  password: string | null
) {
  const {
    rows: [row],
  } = await client.query(`select * from app_private.login($1, $2)`, [
    username,
    password,
  ]);
  return row;
}

const USERNAME = "username";
const PASSWORD = "!TestPassword!";

async function setupTestUser(client: PoolClient) {
  return reallyCreateUser(
    client,
    USERNAME,
    `${USERNAME}@example.com`,
    null,
    null,
    PASSWORD
  );
}

it("can login with username+password", () =>
  withRootDb(async client => {
    const testUser = await setupTestUser(client);
    const session = await login(client, USERNAME, PASSWORD);
    expect(session).toBeTruthy();
    expect(session.user_id).toEqual(testUser.id);
    expect(snapshotSafe(session)).toMatchInlineSnapshot(`
      Object {
        "created_at": "[DATE]",
        "last_active": "[DATE]",
        "user_id": "[ID]",
        "uuid": "[UUID]",
      }
    `);
  }));

it.todo("can login with uSeRnAmE+password");
it.todo("can login with email+password");
it.todo("can login with EmAiL+password");
it.todo("cannot login with wrong password");
it.todo("prevents too many login attempts");

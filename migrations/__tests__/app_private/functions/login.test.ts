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
const EMAIL = `${USERNAME}@example.com`;
const EmAiL = `${USERNAME}@eXaMpLe.cOm`;
const UsErNaMe = "uSeRnAmE";
const PASSWORD = "!TestPassword!";

async function setupTestUser(client: PoolClient) {
  return reallyCreateUser(client, USERNAME, EMAIL, null, null, PASSWORD);
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

it("can login with uSeRnAmE+password", () =>
  withRootDb(async client => {
    const testUser = await setupTestUser(client);
    const session = await login(client, UsErNaMe, PASSWORD);
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

it("can login with email+password", () =>
  withRootDb(async client => {
    const testUser = await setupTestUser(client);
    const session = await login(client, EMAIL, PASSWORD);
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

it("can login with EmAiL+password", () =>
  withRootDb(async client => {
    const testUser = await setupTestUser(client);
    const session = await login(client, EmAiL, PASSWORD);
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

it("cannot login with wrong password", () =>
  withRootDb(async client => {
    await setupTestUser(client);
    const promise = login(client, EMAIL, "WRONG" + PASSWORD);
    expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Incorrect username or password"`
    );
    expect(promise).rejects.toMatchObject({ code: "CREDS" });
  }));

it.todo("prevents too many login attempts");

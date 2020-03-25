import { PoolClient } from "pg";

import { snapshotSafe, withRootDb } from "../../helpers";

export async function reallyCreateUser(
  client: PoolClient,
  username: string | null,
  email: string | null,
  name: string | null,
  avatarUrl: string | null,
  password: string | null,
  emailIsVerified: boolean = false
) {
  const {
    rows: [row],
  } = await client.query(
    `
      select new_user.* from app_private.really_create_user(
        username => $1,
        email => $2,
        email_is_verified => $3,
        name => $4,
        avatar_url => $5,
        password => $6
      ) new_user
      `,
    [username, email, emailIsVerified, name, avatarUrl, password]
  );
  return row;
}

test("can register user with a password", () =>
  withRootDb(async (client) => {
    // Normally PassportLoginPlugin will call this SQL function directly.
    const user = await reallyCreateUser(
      client,
      "testuser",
      "testuser@example.com",
      "Test One",
      "http://example.com",
      "SuperSecurePassword1"
    );
    expect(user).not.toBeNull();
    expect(snapshotSafe(user)).toMatchInlineSnapshot(`
      Object {
        "avatar_url": "http://example.com",
        "created_at": "[DATE]",
        "id": "[ID]",
        "is_admin": false,
        "is_verified": false,
        "name": "Test One",
        "updated_at": "[DATE]",
        "username": "testuser",
      }
    `);
  }));

test("cannot register with a weak password", () =>
  withRootDb(async (client) => {
    const promise = reallyCreateUser(
      client,
      "testuser",
      "testuser@example.com",
      "Test One",
      "http://example.com",
      "WEAK"
    );
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[error: Password is too weak]`
    );
    await expect(promise).rejects.toHaveProperty("code", "WEAKP");
  }));

test("can register user with just a username and email", () =>
  withRootDb(async (client) => {
    // Normally PassportLoginPlugin will call this SQL function directly.
    const user = await reallyCreateUser(
      client,
      "testuser",
      "testuser@example.com",
      null,
      null,
      null
    );
    expect(user).not.toBeNull();
    expect(snapshotSafe(user)).toMatchInlineSnapshot(`
      Object {
        "avatar_url": null,
        "created_at": "[DATE]",
        "id": "[ID]",
        "is_admin": false,
        "is_verified": false,
        "name": null,
        "updated_at": "[DATE]",
        "username": "testuser",
      }
    `);
  }));

test("cannot register user without email", () =>
  withRootDb(async (client) => {
    // Normally PassportLoginPlugin will call this SQL function directly.
    const promise = reallyCreateUser(client, null, null, null, null, null);
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[error: Email is required]`
    );
    await expect(promise).rejects.toMatchObject({
      code: "MODAT",
    });
  }));

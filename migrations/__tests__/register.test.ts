import { withRootDb, snapshotSafe, deleteTestUsers } from "./helpers";

beforeEach(deleteTestUsers);

test("can register user via OAuth", () =>
  withRootDb(async client => {
    const result = await client.query(
      "SELECT * FROM app_private.link_or_register_user($1, $2, $3, $4, $5)",
      [
        null,
        "facebook",
        "123456",
        JSON.stringify({ email: "a@b.c", firstName: "A", lastName: "B" }),
        JSON.stringify({}),
      ]
    );
    const [user] = result.rows;
    expect(user).not.toBeNull();
    expect(snapshotSafe(user)).toMatchInlineSnapshot(`
                        Object {
                          "avatar_url": null,
                          "created_at": "[DATE]",
                          "id": "[ID]",
                          "is_admin": false,
                          "is_verified": true,
                          "name": null,
                          "updated_at": "[DATE]",
                          "username": "user",
                        }
                `);
  }));

test("fails to register user via OAuth without email", () =>
  withRootDb(async client => {
    await expect(
      client.query(
        "SELECT * FROM app_private.link_or_register_user($1, $2, $3, $4, $5)",
        [
          null,
          "facebook",
          "123456",
          JSON.stringify({ email: "", firstName: "A", lastName: "B" }),
          JSON.stringify({}),
        ]
      )
    ).rejects.toMatchInlineSnapshot(
      `[error: new row for relation "user_emails" violates check constraint "user_emails_email_check"]`
    );
  }));

test("can register user with a password", () =>
  withRootDb(async client => {
    // Normally PassportLoginPlugin will call this SQL function directly.
    const result = await client.query(
      `
      select new_user.* from app_private.really_create_user(
        username => $1,
        email => $2,
        email_is_verified => false,
        name => $3,
        avatar_url => $4,
        password => $5
      ) new_user
      `,
      [
        "testuser",
        "testuser@example.com",
        "Test One",
        "http://example.com",
        "SuperSecurePassword1",
      ]
    );
    const [user] = result.rows;
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

test.todo("cannot register with a weak password");

test("can register user with just an email", () =>
  withRootDb(async client => {
    // Normally PassportLoginPlugin will call this SQL function directly.
    const result = await client.query(
      `
      select new_user.* from app_private.really_create_user(
        username => $1,
        email => $2,
        email_is_verified => false,
        name => $3,
        avatar_url => $4,
        password => $5
      ) new_user
      `,
      [null, "testuser@example.com", null, null, null]
    );
    const [user] = result.rows;
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
              "username": "user",
            }
        `);
  }));

test("cannot register user without email", () =>
  withRootDb(async client => {
    // Normally PassportLoginPlugin will call this SQL function directly.
    await expect(
      client.query(
        `
        select new_user.* from app_private.really_create_user(
          username => $1,
          email => $2,
          email_is_verified => false,
          name => $3,
          avatar_url => $4,
          password => $5
        ) new_user
        `,
        [null, null, null, null, null]
      )
    ).rejects.toMatchInlineSnapshot(
      `[error: null value in column "email" violates not-null constraint]`
    );
  }));

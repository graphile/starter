import { withRootDb, snapshotSafe, deleteTestUsers } from "../../helpers";
import { PoolClient } from "pg";

beforeEach(deleteTestUsers);

// Note: registration has already been tested, so we should assume account already exists

async function linkOrRegisterUser(
  client: PoolClient,
  userId: number | null,
  service: string | null,
  identifier: string | null,
  profile: { [key: string]: any } | null,
  authDetails: { [key: string]: any } | null
) {
  const {
    rows: [row],
  } = await client.query(
    `select * from app_private.link_or_register_user($1, $2, $3, $4, $5)`,
    [
      userId,
      service,
      identifier,
      profile ? JSON.stringify(profile) : null,
      authDetails ? JSON.stringify(authDetails) : null,
    ]
  );
  return row;
}

it("can login with full oauth details", () =>
  withRootDb(async client => {
    const user = await linkOrRegisterUser(
      client,
      null,
      "github",
      "123456",
      {
        email: "github.user.123456@example.com",
        name: "GitHub User123456",
        avatar_url: "http://example.com/avatar.jpg",
        username: "GHU123",
      },
      {}
    );
    expect(user).toBeTruthy();
    expect(user.username).toEqual("GHU123");
    expect(user.name).toEqual("GitHub User123456");
    expect(user.avatar_url).toEqual("http://example.com/avatar.jpg");
    expect(user.is_admin).toEqual(false);
    expect(user.is_verified).toEqual(true);
    expect(snapshotSafe(user)).toMatchInlineSnapshot(`
      Object {
        "avatar_url": "http://example.com/avatar.jpg",
        "created_at": "[DATE]",
        "id": "[ID]",
        "is_admin": false,
        "is_verified": true,
        "name": "GitHub User123456",
        "updated_at": "[DATE]",
        "username": "GHU123",
      }
    `);
  }));

it("can login with minimal oauth details", () =>
  withRootDb(async client => {
    const user = await linkOrRegisterUser(
      client,
      null,
      "github",
      "123456",
      {
        email: "github.user.123456@example.com",
      },
      {}
    );
    expect(user).toBeTruthy();
    expect(user.username).toMatch(/^user(?:[1-9][0-9]+)?$/);
    expect(user.name).toEqual(null);
    expect(user.avatar_url).toEqual(null);
    expect(user.is_admin).toEqual(false);
    expect(user.is_verified).toEqual(true);
  }));

test("cannot register without email", () =>
  withRootDb(async client => {
    const promise = client.query(
      "SELECT * FROM app_private.link_or_register_user($1, $2, $3, $4, $5)",
      [
        null,
        "facebook",
        "123456",
        JSON.stringify({ email: null, firstName: "A", lastName: "B" }),
        JSON.stringify({}),
      ]
    );
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[error: Email is required]`
    );
    await expect(promise).rejects.toMatchObject({
      code: "MODAT",
    });
  }));

it("cannot register with invalid email", () =>
  withRootDb(async client => {
    const promise = linkOrRegisterUser(
      client,
      null,
      "github",
      "123456",
      { email: "flibble" },
      {}
    );
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
      `"new row for relation \\"user_emails\\" violates check constraint \\"user_emails_email_check\\""`
    );
    await expect(promise).rejects.toMatchObject({
      code: "23514",
    });
  }));

it.todo("can login with username+password");
it.todo("can login with uSeRnAmE+password");
it.todo("can login with email+password");
it.todo("can login with EmAiL+password");
it.todo("cannot login with wrong password");
it.todo("prevents too many login attempts");
it.todo(
  "login with new oauth sharing email of existing account links accounts"
);
it.todo("login with new oauth when logged in links accounts");

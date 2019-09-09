import { withRootDb } from "./helpers";
import { PoolClient } from "pg";

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

describe("link_or_register_user", () => {
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

  it("cannot login without email", () =>
    withRootDb(async client => {
      await expect(
        linkOrRegisterUser(client, null, "github", "123456", {}, {})
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"null value in column \\"email\\" violates not-null constraint"`
      );
    }));
});

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

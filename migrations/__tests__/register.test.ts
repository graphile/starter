import { withRootDb } from "./test_helpers";
import { snapshotSafe } from "./test_helpers";

test("can register user", () =>
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
        "is_admin": true,
        "is_verified": true,
        "name": null,
        "updated_at": "[DATE]",
        "username": "user",
      }
    `);
  }));

import { withUserDb, asRoot } from "./helpers";

it("can change password", () =>
  withUserDb(async (client, user) => {
    const newPassword = "can change password test DO_NOT_COPY_THIS";

    // Action
    await client.query("select * from app_public.change_password($1, $2)", [
      user._password,
      newPassword,
    ]);

    // Assertions
    const { rows: secrets } = await asRoot(client, () =>
      client.query(
        "select * from app_private.user_secrets where password_hash = crypt($1, password_hash)",
        [newPassword]
      )
    );
    expect(secrets).toHaveLength(1);
    expect(secrets[0].user_id).toEqual(user.id);
  }));

it("cannot change password if password is wrong (CREDS)", () =>
  withUserDb(async client => {
    const newPassword = "can change password test DO_NOT_COPY_THIS";

    // Action
    const promise = client.query(
      "select * from app_public.change_password($1, $2)",
      ["WRONG PASSWORD", newPassword]
    );

    // Assertions
    expect(promise).rejects.toMatchInlineSnapshot(
      `[error: Incorrect password]`
    );
    expect(promise).rejects.toHaveProperty("code", "CREDS");
  }));

it.todo("cannot set a 'weak' password (WEAKP)"); // For a given value of 'weak'
it.todo("only changes one persons password");
it.todo("gives error if not logged in (LOGIN)");

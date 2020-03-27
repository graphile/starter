import { PoolClient } from "pg";

import { asRoot, becomeUser, withRootDb, withUserDb } from "../../helpers";

async function changePassword(
  client: PoolClient,
  oldPassword: string | null | void,
  newPassword: string | null
) {
  const {
    rows: [row],
  } = await client.query(
    `
      select * from app_public.change_password(
        $1,
        $2
      )
      `,
    [oldPassword, newPassword]
  );
  return row;
}

it("can change password", () =>
  withUserDb(async (client, user) => {
    const newPassword = "can change password test DO_NOT_COPY_THIS";

    // Action
    await changePassword(client, user._password, newPassword);

    // Assertions
    const { rows: secrets } = await asRoot(client, () =>
      client.query(
        "select * from app_private.user_secrets where user_id = $1 and password_hash = crypt($2, password_hash)",
        [user.id, newPassword]
      )
    );

    // Check it only changes one person's password
    expect(secrets).toHaveLength(1);
    expect(secrets[0].user_id).toEqual(user.id);
  }));

it("cannot change password if password is wrong (CREDS)", () =>
  withUserDb(async (client) => {
    const newPassword = "SECURE_PASSWORD_1!";

    // Action
    const promise = changePassword(client, "WRONG PASSWORD", newPassword);

    // Assertions
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[error: Incorrect password]`
    );
    await expect(promise).rejects.toHaveProperty("code", "CREDS");
  }));

it("cannot set a 'weak' password (WEAKP)", () =>
  // For a given value of 'weak'
  withUserDb(async (client, user) => {
    const newPassword = "WEAK";

    // Action
    const promise = changePassword(client, user._password, newPassword);

    // Assertions
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[error: Password is too weak]`
    );
    await expect(promise).rejects.toHaveProperty("code", "WEAKP");
  }));

it("gives error if not logged in (LOGIN)", () =>
  withRootDb(async (client) => {
    // Setup
    await becomeUser(client, null);
    const newPassword = "SECURE_PASSWORD_1!";

    // Action
    const promise = changePassword(client, "irrelevant", newPassword);

    // Assertions
    await expect(promise).rejects.toMatchInlineSnapshot(
      `[error: You must log in to change your password]`
    );
    await expect(promise).rejects.toHaveProperty("code", "LOGIN");
  }));

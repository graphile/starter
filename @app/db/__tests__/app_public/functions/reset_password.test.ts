import { PoolClient } from "pg";

import { login } from "../../app_private/functions/login.test";
import { createUsers, getJobs, withRootDb } from "../../helpers";
import { forgotPassword } from "./forgot_password.test";

export async function resetPassword(
  client: PoolClient,
  userId: string | null,
  resetToken: string | null,
  newPassword: string | null
): Promise<boolean | null> {
  const {
    rows: [row],
  } = await client.query(
    'select app_private.reset_password($1, $2, $3) as "bool"',
    [userId, resetToken, newPassword]
  );
  return row ? row.bool : null;
}

it("can use valid token", () =>
  withRootDb(async (client) => {
    // Get the token
    const [user] = await createUsers(client, 1, true);
    await forgotPassword(client, user._email!.toLowerCase());
    const jobs = await getJobs(client, "user__forgot_password");
    const {
      payload: { id, email, token },
    } = jobs[0];

    // Use it
    const newPassword = "ThisIsTheNewPassw0rd";
    const success = await resetPassword(client, id, token, newPassword);
    expect(success).toBe(true);

    // Login
    const session = await login(client, email, newPassword);
    expect(session).toBeTruthy();
    expect(session.user_id).toBeTruthy();
    expect(session.user_id).toEqual(id);
  }));

it("cannot use reset password token twice", () =>
  withRootDb(async (client) => {
    // Get the token
    const [user] = await createUsers(client, 1, true);
    await forgotPassword(client, user._email!.toLowerCase());
    const jobs = await getJobs(client, "user__forgot_password");
    const {
      payload: { id, email, token },
    } = jobs[0];

    // Use it once
    const newPassword = "ThisIsTheNewPassw0rd";
    await resetPassword(client, id, token, newPassword);

    // Attempt to use it a second time
    const newPassword2 = "ThisIsTheNewPassw0rd2";
    const success = await resetPassword(client, id, token, newPassword2);
    expect(success).toBe(null); // bad token

    // Only the old password is still valid
    const session = await login(client, email, newPassword);
    expect(session).toBeTruthy();
    expect(session.user_id).toBeTruthy();
    expect(session.user_id).toEqual(id);
  }));

it("cannot reset password without token", () =>
  withRootDb(async (client) => {
    const [user] = await createUsers(client, 1, true);
    await forgotPassword(client, user._email!.toLowerCase());
    const jobs = await getJobs(client, "user__forgot_password");
    const {
      payload: { id, email },
    } = jobs[0];

    // Use it
    const newPassword = "ThisIsTheNewPassw0rd";
    const success = await resetPassword(client, id, null, newPassword);
    expect(success).toBe(null); // Cannot reset password without token

    // Login should fail
    const session = await login(client, email, newPassword);
    expect(session && session.user_id).toBe(null);
  }));

it("cannot reset password with invalid token", () =>
  withRootDb(async (client) => {
    // Get the token
    const [user] = await createUsers(client, 1, true);
    await forgotPassword(client, user._email!.toLowerCase());
    const jobs = await getJobs(client, "user__forgot_password");
    const {
      payload: { id, email, token },
    } = jobs[0];

    // Use it
    const newPassword = "ThisIsTheNewPassw0rd";
    const corruptedToken = "CCCC" + token.substr(4);
    const success = await resetPassword(
      client,
      id,
      corruptedToken,
      newPassword
    );
    expect(success).toBe(null);

    // Login should fail
    const session = await login(client, email, newPassword);
    expect(session && session.user_id).toBe(null);
  }));

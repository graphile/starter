import { PoolClient } from "pg";
import { withRootDb, createUsers, getJobs } from "../../helpers";
import { forgotPassword } from "./forgot_password.test";
import { login } from "../../app_private/functions/login.test";

export async function resetPassword(
  client: PoolClient,
  userId: number,
  resetToken: string,
  newPassword: string
): Promise<boolean | null> {
  const {
    rows: [row],
  } = await client.query(
    'select app_public.reset_password($1, $2, $3) as "bool"',
    [userId, resetToken, newPassword]
  );
  return row ? row.bool : null;
}

it("can use valid token", () =>
  withRootDb(async client => {
    // Get the token
    const [user] = await createUsers(client, 1, true);
    await forgotPassword(client, user._email!.toLowerCase());
    const jobs = await getJobs(client, "user__forgot_password");
    const {
      payload: { id, email, token },
    } = jobs[0];

    // Use it
    const newPassword = "ThisIsTheNewPassw0rd";
    await resetPassword(client, id, token, newPassword);

    // Login
    const session = await login(client, email, newPassword);
    expect(session).toBeTruthy();
    expect(session.user_id).toBeTruthy();
    expect(session.user_id).toEqual(id);
  }));

it.todo("cannot use reset password token twice");
it.todo("cannot reset password without token");
it.todo("cannot reset password with invalid token");

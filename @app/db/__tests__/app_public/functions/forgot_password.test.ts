import { PoolClient } from "pg";

import { clearJobs, createUsers, getJobs, withRootDb } from "../../helpers";

export async function forgotPassword(
  client: PoolClient,
  email: string
): Promise<boolean | null> {
  const {
    rows: [row],
  } = await client.query('select app_public.forgot_password($1) as "bool"', [
    email,
  ]);
  return row ? row.bool : null;
}

it("can trigger user password reset with email, receive email with token", () =>
  withRootDb(async (client) => {
    const [user] = await createUsers(client, 1, true);
    await forgotPassword(client, user._email!.toLowerCase());
    const jobs = await getJobs(client, "user__forgot_password");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].payload).toMatchObject({
      id: user.id,
      email: user._email,
    });
    expect(jobs[0].payload.token).toBeTruthy();
    expect(typeof jobs[0].payload.token).toBe("string");
  }));

it("can trigger user password reset with EMAIL, receive email with token", () =>
  withRootDb(async (client) => {
    const [user] = await createUsers(client, 1, true);
    await forgotPassword(client, user._email!.toUpperCase());
    const jobs = await getJobs(client, "user__forgot_password");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].payload).toMatchObject({
      id: user.id,
      email: user._email,
    });
    expect(jobs[0].payload.token).toBeTruthy();
    expect(typeof jobs[0].payload.token).toBe("string");
  }));

it("cannot spam re-send of password reset email", () =>
  withRootDb(async (client) => {
    const [user] = await createUsers(client, 1, true);
    await forgotPassword(client, user._email!.toUpperCase());
    await clearJobs(client);
    // Immediately re-send
    await forgotPassword(client, user._email!.toUpperCase());
    const jobs = await getJobs(client, "user__forgot_password");
    expect(jobs).toHaveLength(0);
  }));

it("can trigger re-send of the password reset email", () =>
  withRootDb(async (client) => {
    const [user] = await createUsers(client, 1, true);
    await forgotPassword(client, user._email!.toUpperCase());
    await clearJobs(client);
    await client.query(
      `
        update app_private.user_email_secrets
        set password_reset_email_sent_at = password_reset_email_sent_at - interval '3 minutes'
        where user_email_id = (select id from app_public.user_emails where email = $1)
      `,
      [user._email]
    );
    await forgotPassword(client, user._email!.toUpperCase());
    const jobs = await getJobs(client, "user__forgot_password");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].payload).toMatchObject({
      id: user.id,
      email: user._email,
    });
    expect(jobs[0].payload.token).toBeTruthy();
    expect(typeof jobs[0].payload.token).toBe("string");
  }));

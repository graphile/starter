import { PoolClient } from "pg";

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

it.todo("can use valid token");
it.todo("cannot use reset password token twice");
it.todo("cannot reset password without token");
it.todo("cannot reset password with invalid token");

import { withRootDb, becomeUser, createUsers, asRoot } from "./helpers";

it("deletes session when user logs out", () =>
  withRootDb(async client => {
    const [user] = await createUsers(client, 1);
    await becomeUser(client, user.id);
    const { rows: originalSessions } = await asRoot(client, () =>
      client.query(`select * from app_private.sessions where user_id = $1`, [
        user.id,
      ])
    );
    expect(originalSessions).toHaveLength(1);
    await client.query("select * from app_public.logout()");
    const { rows: finalSessions } = await asRoot(client, () =>
      client.query("select * from app_private.sessions where user_id = $1", [
        user.id,
      ])
    );
    expect(finalSessions).toHaveLength(0);
  }));
it.todo("doesn't throw an error if logged out user logs out (idempotent)");

import { getSessions, withUserDb } from "../../helpers";

it("deletes session when user logs out", () =>
  withUserDb(async (client, user) => {
    // Setup
    const originalSessions = await getSessions(client, user.id);
    expect(originalSessions).toHaveLength(1);

    // Action
    await client.query("select * from app_public.logout()");

    // Assertions
    const finalSessions = await getSessions(client, user.id);
    expect(finalSessions).toHaveLength(0);
  }));

it("doesn't throw an error if logged out user logs out (idempotent)", () =>
  withUserDb(async (client, user) => {
    // Setup
    await client.query("select * from app_public.logout()");

    // Action/assertion: second logout shouldn't error
    await expect(
      client.query("select * from app_public.logout()")
    ).resolves.toBeTruthy();
    const finalSessions = await getSessions(client, user.id);
    expect(finalSessions).toHaveLength(0);
  }));

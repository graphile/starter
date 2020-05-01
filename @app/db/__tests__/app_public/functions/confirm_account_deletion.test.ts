import {
  becomeUser,
  createUsers,
  getJobs,
  withRootDb,
  withUserDb,
} from "../../helpers";

it("can delete account with verified emails", () =>
  withUserDb(async (client, user) => {
    await client.query("select * from app_public.request_account_deletion()");
    const jobs = await getJobs(client, "user__send_delete_account_email");
    expect(jobs).toHaveLength(1);
    const { token, email } = jobs[0].payload;
    expect(email).toEqual(user._email);
    expect(token).toBeTruthy();
    const {
      rows,
    } = await client.query(
      "select app_public.confirm_account_deletion($1) as deleted",
      [token]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].deleted).toBe(true);
    const {
      rows: [{ current_user_id }],
    } = await client.query("select app_public.current_user_id()");
    expect(current_user_id).toBe(null);
  }));

it("can delete account with no verified emails", () =>
  withRootDb(async (client) => {
    const [user] = await createUsers(client, 1, false);
    await becomeUser(client, user.id);
    await client.query("select * from app_public.request_account_deletion()");
    const jobs = await getJobs(client, "user__send_delete_account_email");
    expect(jobs).toHaveLength(1);
    const { token, email } = jobs[0].payload;
    expect(email).toEqual(user._email);
    expect(token).toBeTruthy();
    const {
      rows,
    } = await client.query(
      "select app_public.confirm_account_deletion($1) as deleted",
      [token]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].deleted).toBe(true);
    const {
      rows: [{ current_user_id }],
    } = await client.query("select app_public.current_user_id()");
    expect(current_user_id).toBe(null);
  }));

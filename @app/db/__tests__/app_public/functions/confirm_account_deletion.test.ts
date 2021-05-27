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
    const { rows } = await client.query(
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
    const { rows } = await client.query(
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

it("cannot delete account if organization owner", () =>
  withRootDb(async (client) => {
    const [user] = await createUsers(client, 1);
    await becomeUser(client, user.id);
    await client.query("select * from app_public.create_organization($1, $2)", [
      "myorg",
      "My Organization",
    ]);
    await client.query("select * from app_public.request_account_deletion()");
    const jobs = await getJobs(client, "user__send_delete_account_email");
    expect(jobs).toHaveLength(1);
    const { token, email } = jobs[0].payload;
    expect(email).toEqual(user._email);
    expect(token).toBeTruthy();
    const promise = client.query(
      "select app_public.confirm_account_deletion($1) as deleted",
      [token]
    );
    expect(promise).rejects.toMatchObject({
      code: "OWNER",
    });
  }));

it("can delete account if organization billing contact", () =>
  withRootDb(async (client) => {
    const [orgOwner, userToDelete] = await createUsers(client, 2);
    await becomeUser(client, orgOwner.id);
    const {
      rows: [org],
    } = await client.query(
      "select * from app_public.create_organization($1, $2)",
      ["myorg", "My Organization"]
    );
    await client.query(
      "select * from app_public.invite_to_organization($1, $2)",
      [org.id, userToDelete.username]
    );

    await becomeUser(client, userToDelete.id);
    const invitationJobs = await getJobs(
      client,
      "organization_invitations__send_invite"
    );
    expect(invitationJobs).toHaveLength(1);
    await client.query(
      "select * from app_public.accept_invitation_to_organization($1)",
      [invitationJobs[0].payload.id]
    );

    await becomeUser(client, orgOwner.id);
    await client.query(
      "select app_public.transfer_organization_billing_contact($1, $2)",
      [org.id, userToDelete.id]
    );

    await becomeUser(client, userToDelete.id);
    await client.query("select * from app_public.request_account_deletion()");
    const jobs = await getJobs(client, "user__send_delete_account_email");
    expect(jobs).toHaveLength(1);
    const { token, email } = jobs[0].payload;
    expect(email).toEqual(userToDelete._email);
    expect(token).toBeTruthy();
    await client.query(
      "select app_public.confirm_account_deletion($1) as deleted",
      [token]
    );

    await becomeUser(client, orgOwner.id);
    const { rows } = await client.query(
      "select * from app_public.organization_memberships where organization_id = $1",
      [org.id]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].is_billing_contact).toBe(true);
  }));

import { PoolClient } from "pg";

import {
  createOrganizations,
  createUsers,
} from "../../../../__tests__/helpers";
import {
  asRoot,
  assertJobComplete,
  becomeRoot,
  becomeUser,
  getEmails,
  getJobs,
  runJobs,
  withRootDb,
  withUserDb,
} from "../../helpers";

async function inviteToOrganization(
  client: PoolClient,
  organizationId: string | null | void,
  username: string | null,
  email?: string | null
) {
  const {
    rows: [row],
  } = await client.query(
    `
      select * from app_public.invite_to_organization(
        $1,
        $2,
        $3
      )
      `,
    [organizationId, username, email]
  );
  return row;
}

async function acceptInvitationToOrganization(
  client: PoolClient,
  invitationId: string | null | void,
  code: string | null = null
) {
  const {
    rows: [row],
  } = await client.query(
    `
      select * from app_public.accept_invitation_to_organization(
        $1,
        $2
      )
      `,
    [invitationId, code]
  );
  return row;
}

it("Can invite user to organization", () =>
  withUserDb(async (client, _user) => {
    const [otherUser] = await asRoot(client, (client) =>
      createUsers(client, 1, true)
    );
    const [organization] = await createOrganizations(client, 1);

    // Action
    await inviteToOrganization(client, organization.id, otherUser.username);

    // Assertions
    const { rows: invitations } = await asRoot(client, () =>
      client.query(
        "select * from app_public.organization_invitations where organization_id = $1 order by id asc",
        [organization.id]
      )
    );

    expect(invitations).toHaveLength(1);
    const [invitation] = invitations;
    expect(invitation.user_id).toEqual(otherUser.id);
    expect(invitation.email).toEqual(null);
    expect(invitation.code).toEqual(null);

    const jobs = await getJobs(client, "organization_invitations__send_invite");
    expect(jobs).toHaveLength(1);
    const [job] = jobs;
    expect(job.payload).toMatchObject({
      id: invitation.id,
    });

    // Assert that the job can run correctly
    // Run the job
    await runJobs(client);
    await assertJobComplete(client, job);
    // Check that the email was sent
    const emails = getEmails();
    expect(emails).toHaveLength(1);
    const [email] = emails;
    expect(email.envelope.to).toEqual(["b@b.c"]);
    const message = JSON.parse(email.message);
    expect(message.subject).toEqual(
      `You have been invited to ${organization.name}`
    );
    const expectedLink = `${process.env.ROOT_URL}/invitations/accept?id=${invitation.id}`;
    expect(message.html).toContain(expectedLink);
  }));

it("Can accept an invitation", () =>
  withRootDb(async (client) => {
    // Setup
    const [organizationOwner, invitee] = await createUsers(client, 2, true);
    await becomeUser(client, organizationOwner);
    const [organization] = await createOrganizations(client, 1);
    await inviteToOrganization(client, organization.id, invitee.username);
    await becomeRoot(client);
    const {
      rows: [invitation],
    } = await client.query(
      `select * from app_public.organization_invitations order by id desc limit 1`
    );

    // Action
    await becomeUser(client, invitee);
    await acceptInvitationToOrganization(client, invitation.id);

    // Assertions
    await becomeRoot(client);
    const {
      rows: [invitationShouldntExist],
    } = await client.query(
      `select * from app_public.organization_invitations where id = $1`,
      [invitation.id]
    );
    expect(invitationShouldntExist).toBeFalsy();
    const {
      rows: [membership],
    } = await client.query(
      `select * from app_public.organization_memberships where organization_id = $1 and user_id = $2`,
      [organization.id, invitee.id]
    );
    expect(membership).toBeTruthy();
    expect(membership.is_owner).toEqual(false);
    expect(membership.is_billing_contact).toEqual(false);
  }));

it("Can accept an invitation that was sent to an email address", () =>
  withRootDb(async (client) => {
    // Setup
    const [organizationOwner, invitee] = await createUsers(client, 2, true);
    await becomeUser(client, organizationOwner);
    const [organization] = await createOrganizations(client, 1);
    await inviteToOrganization(
      client,
      organization.id,
      null,
      "different@example.com"
    );
    await becomeRoot(client);
    const {
      rows: [invitation],
    } = await client.query(
      `select * from app_public.organization_invitations order by id desc limit 1`
    );

    // Action
    await becomeUser(client, invitee);
    await acceptInvitationToOrganization(
      client,
      invitation.id,
      invitation.code
    );

    // Assertions
    await becomeRoot(client);
    const {
      rows: [invitationShouldntExist],
    } = await client.query(
      `select * from app_public.organization_invitations where id = $1`,
      [invitation.id]
    );
    expect(invitationShouldntExist).toBeFalsy();
    const {
      rows: [membership],
    } = await client.query(
      `select * from app_public.organization_memberships where organization_id = $1 and user_id = $2`,
      [organization.id, invitee.id]
    );
    expect(membership).toBeTruthy();
    expect(membership.is_owner).toEqual(false);
    expect(membership.is_billing_contact).toEqual(false);
  }));

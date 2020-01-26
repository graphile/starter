import { withUserDb, asRoot, getJobs } from "../../helpers";
import { PoolClient } from "pg";
import {
  createUsers,
  createOrganizations,
} from "../../../../__tests__/helpers";

async function inviteToOrganization(
  client: PoolClient,
  organizationId: number | null | void,
  userId: number | null,
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
    [organizationId, userId, email]
  );
  return row;
}

it("Can invite user to organization", () =>
  withUserDb(async (client, _user) => {
    const [otherUser] = await asRoot(client, client =>
      createUsers(client, 1, true)
    );
    const [organization] = await createOrganizations(client, 1);

    // Action
    await inviteToOrganization(client, organization.id, otherUser.id);

    // Assertions
    const { rows: invitations } = await asRoot(client, () =>
      client.query(
        "select * from app_public.organization_invitations where organization_id = $1",
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
  }));

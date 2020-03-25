import { Task } from "graphile-worker";

import { SendEmailPayload } from "./send_email";

interface OrganizationInvitationSendInvitePayload {
  /**
   * invitation id
   */
  id: string;
}

const task: Task = async (inPayload, { addJob, withPgClient }) => {
  const payload: OrganizationInvitationSendInvitePayload = inPayload as any;
  const { id: invitationId } = payload;
  const {
    rows: [invitation],
  } = await withPgClient((pgClient) =>
    pgClient.query(
      `
        select *
        from app_public.organization_invitations
        where id = $1
      `,
      [invitationId]
    )
  );
  if (!invitation) {
    console.error("Invitation not found; aborting");
    return;
  }

  let email = invitation.email;
  if (!email) {
    const {
      rows: [primaryEmail],
    } = await withPgClient((pgClient) =>
      pgClient.query(
        `select * from app_public.user_emails where user_id = $1 and is_primary = true`,
        [invitation.user_id]
      )
    );
    if (!primaryEmail) {
      console.error(
        `No primary email found for user ${invitation.user_id}; aborting`
      );
      return;
    }
    email = primaryEmail.email;
  }

  const {
    rows: [organization],
  } = await withPgClient((pgClient) =>
    pgClient.query(`select * from app_public.organizations where id = $1`, [
      invitation.organization_id,
    ])
  );

  const sendEmailPayload: SendEmailPayload = {
    options: {
      to: email,
      subject: `You have been invited to ${organization.name}`,
    },
    template: "organization_invite.mjml",
    variables: {
      organizationName: organization.name,
      link:
        `${process.env.ROOT_URL}/invitations/accept?id=${encodeURIComponent(
          invitation.id
        )}` +
        (invitation.code ? `&code=${encodeURIComponent(invitation.code)}` : ""),
    },
  };
  await addJob("send_email", sendEmailPayload);
};

module.exports = task;

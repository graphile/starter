import { Task } from "graphile-worker";
import { SendEmailPayload } from "./send_email";

interface UserEmailsSendVerificationPayload {
  id: number;
}

const task: Task = async (inPayload, { addJob, withPgClient }) => {
  const payload: UserEmailsSendVerificationPayload = inPayload as any;
  const { id: userEmailId } = payload;
  const {
    rows: [userEmail],
  } = await withPgClient(pgClient =>
    pgClient.query(
      `
        select email, verification_token, username, name
        from app_public.user_emails
        inner join app_private.user_email_secrets
        on user_email_secrets.user_email_id = user_emails.id
        inner join app_public.users
        on users.id = user_emails.user_id
        where user_emails.id = $1
        and user_emails.is_verified is false
      `,
      [userEmailId]
    )
  );
  if (!userEmail) {
    console.dir(userEmail);
    console.log(userEmailId);
    throw new Error("Really?");
    // No longer relevant
    return;
  }
  const { email, verification_token, username, name } = userEmail;
  const sendEmailPayload: SendEmailPayload = {
    options: {
      to: email,
      subject: "Please verify your email address",
    },
    template: "verify_email.mjml",
    variables: {
      token: verification_token,
      verifyLink: `${process.env.ROOT_URL}/verify?id=${encodeURIComponent(
        String(userEmailId)
      )}&token=${encodeURIComponent(verification_token)}`,
      username,
      name,
    },
  };
  await addJob("send_email", sendEmailPayload);
};

export default task;

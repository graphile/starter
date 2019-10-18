import { Task } from "graphile-worker";
import { SendEmailPayload } from "./send_email";

// At least 3 minutes between resending emails
const MIN_INTERVAL = 1000 * 60 * 3

interface UserForgotPasswordUnregisteredEmailPayload {
  email: string;
}

interface UnregisteredEmailQueryResult {
  seconds_since_email_sent: number;
}

const task: Task = async (inPayload, { addJob, withPgClient }) => {
  const payload: UserForgotPasswordUnregisteredEmailPayload = inPayload as any;
  const email = payload.email;
  const {
    rows: [unregisteredEmail],
  } = await withPgClient(pgClient =>
    pgClient.query<UnregisteredEmailQueryResult>(
      `
      select extract(epoch from now()) - extract(epoch from password_reset_email_sent_at) as seconds_since_email_sent
      from app_private.unregistered_email_password_resets
      where unregistered_email_password_resets.email = $1
    `,
      [email]
    )
  );
  if (unregisteredEmail) {
    const { seconds_since_email_sent } = unregisteredEmail;
    if (
      seconds_since_email_sent != null &&
      seconds_since_email_sent < MIN_INTERVAL / 1000
    ) {
      console.log("Unregistered password reset email sent too recently");
      return;
    }
  }

  const sendEmailPayload: SendEmailPayload = {
    options: {
      to: email,
      subject: "Attempted account access",
    },
    template: "password_reset_unregistered.mjml",
    variables: {}
  };
  await addJob("send_email", sendEmailPayload);
  await withPgClient(pgClient =>
    pgClient.query(
      // upsert to indicate that email has been sent
      `insert into app_private.unregistered_email_password_resets
      (email, password_reset_email_sent_at)
      values
      ($1, now())
      on conflict (email) do update
        set password_reset_email_sent_at = now();
      `,
      [email]
    )
  );
};

module.exports = task;

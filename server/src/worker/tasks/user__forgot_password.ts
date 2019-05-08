/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import { Task } from "graphile-worker";
import { SendEmailPayload } from "./send_email";

interface UserForgotPasswordPayload {
  /**
   * user_email id
   */
  id: number;

  /**
   * email address
   */
  email: string;

  /**
   * secret token
   */
  token: string;
}

const task: Task = async (inPayload, { addJob, withPgClient }) => {
  const payload: UserForgotPasswordPayload = inPayload as any;
  const { id: userEmailId, email, token } = payload;
  const {
    rows: [user],
  } = await withPgClient(pgClient =>
    pgClient.query(
      `
      select users.*
      from app_public.users
      inner join app_public.user_emails
      on user_emails.user_id = users.id
      where user_emails.id = $1
    `,
      [userEmailId]
    )
  );
  if (!user) {
    console.error("User not found; aborting");
    return;
  }
  const sendEmailPayload: SendEmailPayload = {
    options: {
      to: email,
      subject: "Password reset",
    },
    template: "password_reset.mjml",
    variables: {
      token,
      verifyLink: `${process.env.ROOT_URL}/reset?id=${encodeURIComponent(
        String(userEmailId)
      )}&user_id=${encodeURIComponent(user.id)}&token=${encodeURIComponent(
        token
      )}`,
    },
  };
  await addJob("send_email", sendEmailPayload);
};

module.exports = task;

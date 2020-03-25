import { Task } from "graphile-worker";

import { SendEmailPayload } from "./send_email";

interface UserSendAccountDeletionEmailPayload {
  /**
   * email address
   */
  email: string;

  /**
   * secret token
   */
  token: string;
}

const task: Task = async (inPayload, { addJob }) => {
  const payload: UserSendAccountDeletionEmailPayload = inPayload as any;
  const { email, token } = payload;
  const sendEmailPayload: SendEmailPayload = {
    options: {
      to: email,
      subject: "Confirmation required: really delete account?",
    },
    template: "delete_account.mjml",
    variables: {
      token,
      deleteAccountLink: `${
        process.env.ROOT_URL
      }/settings/delete?token=${encodeURIComponent(token)}`,
    },
  };
  await addJob("send_email", sendEmailPayload);
};

module.exports = task;

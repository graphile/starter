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

const task: Task = async (inPayload, { addJob }) => {
  const payload: UserForgotPasswordPayload = inPayload as any;
  const { id: userEmailId, email, token } = payload;
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
      )}&token=${encodeURIComponent(token)}`,
    },
  };
  await addJob("send_email", sendEmailPayload);
};

module.exports = task;

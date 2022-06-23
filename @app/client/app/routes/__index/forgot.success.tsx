import { useSearchParams } from "@remix-run/react";
import { Alert } from "antd";

import type { TypedDataFunctionArgs } from "~/utils/remix-typed";
import { requireNoUser } from "~/utils/users";

export const handle = { hideLogin: true, title: "Forgot Password" };

export const loader = async ({ context }: TypedDataFunctionArgs) => {
  await requireNoUser(context);
  return null;
};

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") as string;
  return (
    <Alert
      type="success"
      message="You've got mail"
      description={`We've sent an email reset link to '${email}'; click the link and follow the instructions. If you don't receive the link, please ensure you entered the email address correctly, and check in your spam folder just in case.`}
    />
  );
}

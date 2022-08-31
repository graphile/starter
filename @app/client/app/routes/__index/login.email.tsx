import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { getCodeFromError } from "@app/lib";
import { json } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { AuthenticityTokenInput } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import * as z from "zod";

import { ErrorAlert, FormInput, SubmitButton } from "~/components";
import { validateCsrfToken } from "~/utils/csrf";
import type { GraphqlQueryErrorResult } from "~/utils/errors";
import type { TypedDataFunctionArgs } from "~/utils/remix-typed";
import { redirectTyped } from "~/utils/remix-typed";
import { isSafe } from "~/utils/uri";
import { requireNoUser } from "~/utils/users";
export const handle = { hideLogin: true, title: "Login" };

export const loader = async ({ context }: TypedDataFunctionArgs) => {
  await requireNoUser(context);
  return null;
};

export const action = async ({ request, context }: TypedDataFunctionArgs) => {
  await validateCsrfToken(request, context);
  const sdk = await context.graphqlSdk;
  const fieldValues = await loginFormValidator.validate(
    await request.formData()
  );
  if (fieldValues.error) {
    return validationError(fieldValues.error, {
      username: fieldValues.submittedData.username,
    });
  }
  const { username, password, redirectTo } = fieldValues.data;
  try {
    await sdk.Login({ username, password });
    return redirectTyped(redirectTo ?? "/");
  } catch (e) {
    const code = getCodeFromError(e);
    if (code === "CREDS") {
      return validationError(
        {
          fieldErrors: {
            password: "Incorrect username or passphrase",
          },
        },
        {
          username: fieldValues.submittedData.username,
        }
      );
    }
    return json<GraphqlQueryErrorResult>({
      message: e.message,
      code,
      error: true,
    });
  }
};

const loginSchema = z.object({
  username: z.string().nonempty("Please input your username"),
  password: z.string().nonempty("Please input your passphrase"),
  redirectTo: z.string().optional(),
});

const loginFormValidator = withZod(loginSchema);

export default function LoginEmail() {
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get("next");
  const next = isSafe(rawNext) ? rawNext : "/";

  const { message, code, error } =
    useActionData<GraphqlQueryErrorResult>() ?? {};

  return (
    <ValidatedForm
      validator={loginFormValidator}
      method="post"
      className="flex flex-col max-w-lg w-full gap-y-5"
    >
      <AuthenticityTokenInput />
      <input type="hidden" name="redirectTo" value={next} />
      <FormInput
        name="username"
        placeholder="E-mail or Username"
        required
        type="text"
        autoComplete="username"
        inputPrefix={<UserOutlined />}
        data-cy="loginpage-input-username"
      />
      <FormInput
        name="password"
        placeholder="Passphrase"
        required
        type="password"
        autoComplete="current-password"
        inputPrefix={<LockOutlined />}
        data-cy="loginpage-input-password"
      />
      <Link className="link mb-6" to="/forgot">
        Forgotten passphrase?
      </Link>
      {error ? (
        <ErrorAlert title="Login failed" message={message} code={code} />
      ) : null}

      <div className="flex justify-between align-center">
        <SubmitButton data-cy="loginpage-button-submit">Sign in</SubmitButton>
        <Link className="link self-center" to="/login">
          Use a different sign in method
        </Link>
      </div>
    </ValidatedForm>
  );
}

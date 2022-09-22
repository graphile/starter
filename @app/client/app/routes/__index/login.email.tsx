import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { getCodeFromError } from "@app/lib";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useActionData, useSearchParams } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { withZod } from "@remix-validated-form/with-zod";
import { Alert, Col, Form, Row } from "antd";
import { AuthenticityTokenInput } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import * as z from "zod";

import { FormInput } from "~/components/forms/FormInput";
import { SubmitButton } from "~/components/forms/SubmitButton";
import { validateCsrfToken } from "~/utils/csrf";
import type { GraphqlQueryErrorResult } from "~/utils/errors";
import { extractGraphqlErrorFromFormAction } from "~/utils/errors";
import { isSafe } from "~/utils/uri";
import { requireNoUser } from "~/utils/users";

export const handle = { hideLogin: true, title: "Login" };

export const loader = async ({ context }: LoaderArgs) => {
  await requireNoUser(context);
  return null;
};

export const action = async ({ request, context }: ActionArgs) => {
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
    return redirect(redirectTo ?? "/");
  } catch (e: any) {
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

  const { message, code, error } = extractGraphqlErrorFromFormAction(
    useActionData<typeof action>()
  );

  return (
    <Row justify="center" style={{ marginTop: 32 }}>
      <Col xs={24} sm={12}>
        <Row>
          <ValidatedForm
            validator={loginFormValidator}
            method="post"
            style={{ width: "100%" }}
          >
            <AuthenticityTokenInput />
            <input type="hidden" name="redirectTo" value={next} />
            <FormInput
              name="username"
              placeholder="E-mail or Username"
              required
              type="text"
              autoComplete="username"
              size="large"
              prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              data-cy="loginpage-input-username"
            />
            <FormInput
              name="password"
              placeholder="Passphrase"
              required
              type="password"
              autoComplete="current-password"
              size="large"
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              data-cy="loginpage-input-password"
            />
            <Form.Item>
              <Link to="/forgot">Forgotten passphrase?</Link>
            </Form.Item>
            {error ? (
              <Form.Item>
                <Alert
                  type="error"
                  message={`Sign in failed`}
                  description={
                    <span>
                      {message}
                      {code ? (
                        <span>
                          {" "}
                          (Error code: <code>ERR_{code}</code>)
                        </span>
                      ) : null}
                    </span>
                  }
                />
              </Form.Item>
            ) : null}
            <Form.Item>
              <SubmitButton type="primary" data-cy="loginpage-button-submit">
                Sign in
              </SubmitButton>
              <Link style={{ marginLeft: 16 }} to="/login">
                Use a different sign in method
              </Link>
            </Form.Item>
          </ValidatedForm>
        </Row>
      </Col>
    </Row>
  );
}

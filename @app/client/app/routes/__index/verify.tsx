import { getCodeFromError } from "@app/lib";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
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

export const handle = { hideLogin: true, title: "Login" };

export const loader = async ({ request, context }: LoaderArgs) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const token = url.searchParams.get("token");
  if (id && token) {
    const sdk = await context.graphqlSdk;
    const result = await sdk.VerifyEmail({ id, token });
    if (result.verifyEmail?.success) {
      return json({ success: true });
    }
  }
  return json({ success: false });
};

export const action = async ({ request, context }: ActionArgs) => {
  await validateCsrfToken(request, context);
  const sdk = await context.graphqlSdk;
  const fieldValues = await verifyFormValidator.validate(
    await request.formData()
  );
  if (fieldValues.error) {
    return validationError(fieldValues.error);
  }
  const { id, token } = fieldValues.data;
  try {
    const result = await sdk.VerifyEmail({ id, token });
    if (result.verifyEmail?.success) {
      return json({ success: true });
    }
    return validationError({
      fieldErrors: {
        token: "Incorrect token, please check and try again",
      },
    });
  } catch (e: any) {
    const code = getCodeFromError(e);
    return json<GraphqlQueryErrorResult>({
      message: e.message,
      code,
      error: true,
    });
  }
};

const verifySchema = z.object({
  id: z.string().nonempty(),
  token: z.string().nonempty("Please input your token"),
});

const verifyFormValidator = withZod(verifySchema);

export default function Verify() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const token = searchParams.get("token") ?? "";

  const actionData = useActionData<typeof action>();

  const success =
    actionData && "success" in actionData ? actionData.success : false;

  const { message, code, error } =
    extractGraphqlErrorFromFormAction(actionData);

  const { success: loaderSuccess } = useLoaderData<typeof loader>();

  return (
    <Row justify="center" style={{ marginTop: 32 }}>
      <Col xs={24} sm={12}>
        <Row>
          {success || loaderSuccess ? (
            <Alert
              type="success"
              showIcon
              message="Email Verified"
              description="Thank you for verifying your email address. You may now close this window."
            />
          ) : (
            <ValidatedForm
              defaultValues={{ token }}
              validator={verifyFormValidator}
              method="post"
              style={{ width: "100%" }}
            >
              <AuthenticityTokenInput />
              <input type="hidden" name="id" value={id} />
              <FormInput
                name="token"
                label="Please enter verification code"
                placeholder="Verification code"
                required
                type="text"
                size="large"
              />
              {error ? (
                <Form.Item>
                  <Alert
                    type="error"
                    message={`Token validation failed`}
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
                <SubmitButton type="primary">Submit</SubmitButton>
              </Form.Item>
            </ValidatedForm>
          )}
        </Row>
      </Col>
    </Row>
  );
}

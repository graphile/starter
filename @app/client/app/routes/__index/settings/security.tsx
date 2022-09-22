import { formItemLayout, getCodeFromError, tailFormItemLayout } from "@app/lib";
import { json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { withZod } from "@remix-validated-form/with-zod";
import { Alert, Form, PageHeader } from "antd";
import { useState } from "react";
import { AuthenticityTokenInput } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import * as z from "zod";

import { PasswordStrength } from "~/components";
import { FormInput } from "~/components/forms/FormInput";
import { SubmitButton } from "~/components/forms/SubmitButton";
import { validateCsrfToken } from "~/utils/csrf";
import type { GraphqlQueryErrorResult } from "~/utils/errors";
import { setPasswordStrengthInfo } from "~/utils/passwords";
import { requireUser } from "~/utils/users";

export const handle = { title: "Settings: Profile" };

export async function loader({ request, context }: LoaderArgs) {
  await requireUser(request, context);
  return null;
}

const securitySchema = z.object({
  oldPassword: z.string().nonempty("Please input your passphrase"),
  newPassword: z.string().nonempty("Please confirm your passphrase"),
});

const securityFormValidator = withZod(securitySchema);

export async function action({ request, context }: ActionArgs) {
  await validateCsrfToken(request, context);
  const sdk = await context.graphqlSdk;
  const fieldValues = await securityFormValidator.validate(
    await request.formData()
  );
  if (fieldValues.error) {
    return validationError(fieldValues.error);
  }
  const { oldPassword, newPassword } = fieldValues.data;
  try {
    await sdk.ChangePassword({ oldPassword, newPassword });
  } catch (e: any) {
    const code = getCodeFromError(e);
    if (code === "LOGIN") {
      throw redirect(
        `/login?next=${encodeURIComponent(new URL(request.url).pathname)}`
      );
    }
    if (code === "WEAKP") {
      return validationError({
        fieldErrors: {
          newPassword:
            "The server believes this passphrase is too weak, please make it stronger",
        },
      });
    }
    if (code === "CREDS") {
      return validationError({
        fieldErrors: {
          oldPassword: "Incorrect old passphrase",
        },
      });
    }
    return json<GraphqlQueryErrorResult>({
      message: e.message,
      code,
      error: true,
    });
  }
  return { success: true };
}

export default function Passphrase() {
  const { message, code, error, success } =
    useActionData<GraphqlQueryErrorResult & { success?: true }>() ?? {};

  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordDirty, setPasswordDirty] = useState(false);

  // TODO: ant design inputs cannot be reset from the outside with `form.reset()`

  return (
    <div>
      <PageHeader title="Change passphrase" />
      <ValidatedForm
        validator={securityFormValidator}
        method="post"
        style={{ width: "100%" }}
      >
        <AuthenticityTokenInput />
        <FormInput
          name="oldPassword"
          label="Old passphrase"
          required
          type="password"
          autoComplete="current-password"
          {...formItemLayout}
        />
        <FormInput
          name="newPassword"
          label="New passphrase"
          required
          type="password"
          onChange={(e) => {
            setPasswordStrengthInfo(
              e.target.value,
              setPasswordStrength,
              setPasswordSuggestions
            );
            setPasswordDirty(true);
          }}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          autoComplete="new-password"
          {...formItemLayout}
        >
          <PasswordStrength
            passwordStrength={passwordStrength}
            suggestions={passwordSuggestions}
            isDirty={passwordDirty}
            isFocussed={passwordFocused}
          />
        </FormInput>
        {error ? (
          <Form.Item>
            <Alert
              type="error"
              message={`Changing passphrase failed`}
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
        ) : success ? (
          <Form.Item>
            <Alert type="success" message={`Password changed!`} />
          </Form.Item>
        ) : null}
        <Form.Item {...tailFormItemLayout}>
          <SubmitButton htmlType="submit">Change Passphrase</SubmitButton>
        </Form.Item>
      </ValidatedForm>
    </div>
  );
}

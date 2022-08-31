import { getCodeFromError } from "@app/lib";
import { json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useState } from "react";
import { AuthenticityTokenInput } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import * as z from "zod";

import { ErrorAlert, PasswordStrength, SuccessAlert } from "~/components";
import { FormInput } from "~/components/forms/FormInput";
import { SubmitButton } from "~/components/forms/SubmitButton";
import { validateCsrfToken } from "~/utils/csrf";
import type { GraphqlQueryErrorResult } from "~/utils/errors";
import { setPasswordStrengthInfo } from "~/utils/passwords";
import type { TypedDataFunctionArgs } from "~/utils/remix-typed";
import { redirectTyped } from "~/utils/remix-typed";
import { requireUser } from "~/utils/users";

export const handle = { title: "Settings: Profile" };

export async function loader({ request, context }: TypedDataFunctionArgs) {
  await requireUser(request, context);
  return null;
}

const securitySchema = z.object({
  oldPassword: z.string().nonempty("Please enter your current passphrase"),
  newPassword: z.string().nonempty("Please enter your new passphrase"),
});

const securityFormValidator = withZod(securitySchema);

export async function action({ request, context }: TypedDataFunctionArgs) {
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
  } catch (e) {
    const code = getCodeFromError(e);
    if (code === "LOGIN") {
      throw redirectTyped(
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
  const [passwordDirty, setPasswordDirty] = useState(false);

  return (
    <ValidatedForm
      validator={securityFormValidator}
      method="post"
      resetAfterSubmit
      onReset={() => setPasswordDirty(false)}
      className="flex flex-col max-w-lg w-full gap-y-5"
    >
      <AuthenticityTokenInput />
      <h1 className="text-2xl text-center mb-4">Change Passphrase</h1>
      <FormInput
        name="oldPassword"
        label="Old passphrase"
        required
        type="password"
        autoComplete="current-password"
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
        autoComplete="new-password"
      >
        <PasswordStrength
          passwordStrength={passwordStrength}
          suggestions={passwordSuggestions}
          isDirty={passwordDirty}
        />
      </FormInput>
      {error ? (
        <ErrorAlert
          title="Changing passphrase failed"
          message={message}
          code={code}
        />
      ) : success ? (
        <SuccessAlert title="Passphrase updated" />
      ) : null}
      {!success && <SubmitButton>Change Passphrase</SubmitButton>}
    </ValidatedForm>
  );
}

import type { EmailsForm_UserEmailFragment } from "@app/graphql";
import { getCodeFromError } from "@app/lib";
import { Form, useActionData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { withZod } from "@remix-validated-form/with-zod";
import { useState } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { AuthenticityTokenInput } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import * as z from "zod";

import { WarningAlert } from "~/components";
import { FormInput } from "~/components/forms/FormInput";
import { SubmitButton } from "~/components/forms/SubmitButton";
import { validateCsrfToken } from "~/utils/csrf";
import type { GraphqlQueryErrorResult } from "~/utils/errors";
import type { TypedDataFunctionArgs } from "~/utils/remix-typed";
import { jsonTyped, useLoaderDataTyped } from "~/utils/remix-typed";
import { requireUser } from "~/utils/users";

export const handle = { title: "Settings: Emails" };

export async function loader({ request, context }: TypedDataFunctionArgs) {
  await requireUser(request, context);
  const sdk = await context.graphqlSdk;
  const { currentUser } = await sdk.SettingsEmails();
  return jsonTyped(currentUser!);
}

const emailId = z.object({
  emailId: z.string().nonempty(),
});

const emailIdValidator = withZod(emailId);

const addEmail = z.object({
  email: z.string().email("Please enter an email address"),
});

const addEmailValidator = withZod(addEmail);

export async function action({ request, context }: TypedDataFunctionArgs) {
  await validateCsrfToken(request, context);
  const sdk = await context.graphqlSdk;
  const data = await request.formData();
  console.log(data);
  const subaction = data.get("subaction");
  if (subaction === "add") {
    const validationResult = await addEmailValidator.validate(data);
    if (validationResult.error) {
      return validationError(validationResult.error);
    }
    try {
      await sdk.AddEmail({ email: validationResult.data.email });
    } catch (e) {
      const code = getCodeFromError(e);
      return json<GraphqlQueryErrorResult>({
        message: e.message,
        code,
        error: true,
      });
    }
  }
  const validationResult = await emailIdValidator.validate(data);
  if (validationResult.error) {
    return null;
  }
  const { emailId } = validationResult.data;
  if (subaction === "delete") {
    await sdk.DeleteEmail({ emailId });
    return null;
  } else if (subaction === "resend_verification") {
    await sdk.ResendEmailVerification({ emailId });
    return null;
  } else if (subaction === "make_primary") {
    await sdk.MakeEmailPrimary({ emailId });
    return null;
  }
}

// function Email({
//   email,
//   hasOtherEmails,
// }: {
//   email: EmailsForm_UserEmailFragment;
//   hasOtherEmails: boolean;
// }) {
//   const canDelete = !email.isPrimary && hasOtherEmails;
//   return (
//     <List.Item
//       data-cy={`settingsemails-emailitem-${email.email.replace(
//         /[^a-zA-Z0-9]/g,
//         "-"
//       )}`}
//       key={email.id}
//       actions={[
//         email.isPrimary && (
//           <span data-cy="settingsemails-indicator-primary">Primary</span>
//         ),
//         canDelete && (
//           <Form style={{ display: "inline" }} method="post">
//             <AuthenticityTokenInput />
//             <input type="hidden" name="emailId" value={email.id} />
//             <input type="hidden" name="subaction" value="delete" />
//             <button type="submit" data-cy="settingsemails-button-delete">
//               Delete
//             </button>
//           </Form>
//         ),
//         !email.isVerified && (
//           <Form style={{ display: "inline" }} method="post">
//             <AuthenticityTokenInput />
//             <input type="hidden" name="emailId" value={email.id} />
//             <input type="hidden" name="subaction" value="resend_verification" />
//             <button type="submit">Resend verification</button>
//           </Form>
//         ),
//         email.isVerified && !email.isPrimary && (
//           <Form style={{ display: "inline" }} method="post">
//             <AuthenticityTokenInput />
//             <input type="hidden" name="emailId" value={email.id} />
//             <input type="hidden" name="subaction" value="make_primary" />
//             <button type="submit" data-cy="settingsemails-button-makeprimary">
//               Make primary
//             </button>
//           </Form>
//         ),
//       ].filter((_) => _)}
//     >
//       <List.Item.Meta
//         avatar={
//           <Avatar size="large" style={{ backgroundColor: "transparent" }}>
//             ✉️
//           </Avatar>
//         }
//         title={
//           <span>
//             {" "}
//             {email.email}{" "}
//             <span
//               title={
//                 email.isVerified
//                   ? "Verified"
//                   : "Pending verification (please check your inbox / spam folder"
//               }
//             >
//               {" "}
//               {email.isVerified ? (
//                 "✅"
//               ) : (
//                 <small style={{ color: "red" }}>(unverified)</small>
//               )}{" "}
//             </span>{" "}
//           </span>
//         }
//         description={`Added ${new Date(
//           Date.parse(email.createdAt)
//         ).toLocaleString()}`}
//       />
//     </List.Item>
//   );
// }

function Email({
  email,
  hasOtherEmails,
}: {
  email: EmailsForm_UserEmailFragment;
  hasOtherEmails: boolean;
}) {
  const canDelete = !email.isPrimary && hasOtherEmails;
  return (
    <>
      <div
        data-cy={`settingsemails-emailitem-${email.email.replace(
          /[^a-zA-Z0-9]/g,
          "-"
        )}`}
        key={email.id}
        className="flex flex-row items-center gap-x-3 border-b py-3 border-base-content/60"
      >
        <div className="text-2xl flex-shrink-0">
          <HiOutlineMail />
        </div>
        <div className="flex-grow">
          <p>
            {email.email}{" "}
            <span
              title={
                email.isVerified
                  ? "Verified"
                  : "Pending verification (please check your inbox / spam folder"
              }
            >
              {" "}
              {email.isVerified ? (
                "✅"
              ) : (
                <small className="text-error">(unverified)</small>
              )}{" "}
            </span>
          </p>
          <p className="text-base-content/70">
            Added {new Date(Date.parse(email.createdAt)).toLocaleString()}
          </p>
        </div>
        {email.isPrimary && (
          <span
            data-cy="settingsemails-indicator-primary"
            className="text-base-content/70"
          >
            Primary
          </span>
        )}
        {canDelete && (
          <Form style={{ display: "inline" }} method="post">
            <AuthenticityTokenInput />
            <input type="hidden" name="emailId" value={email.id} />
            <input type="hidden" name="subaction" value="delete" />
            <button
              type="submit"
              data-cy="settingsemails-button-delete"
              className="link link-secondary"
            >
              Delete
            </button>
          </Form>
        )}
        {!email.isVerified && (
          <Form style={{ display: "inline" }} method="post">
            <AuthenticityTokenInput />
            <input type="hidden" name="emailId" value={email.id} />
            <input type="hidden" name="subaction" value="resend_verification" />
            <button type="submit" className="link link-secondary">
              Resend verification
            </button>
          </Form>
        )}
        {email.isVerified && !email.isPrimary && (
          <Form style={{ display: "inline" }} method="post">
            <AuthenticityTokenInput />
            <input type="hidden" name="emailId" value={email.id} />
            <input type="hidden" name="subaction" value="make_primary" />
            <button
              type="submit"
              data-cy="settingsemails-button-makeprimary"
              className="link link-secondary"
            >
              Make primary
            </button>
          </Form>
        )}
      </div>
    </>
  );
}

export default function ManageEmails() {
  const user = useLoaderDataTyped<typeof loader>();
  const [showAddEmailForm, setShowAddEmailForm] = useState(false);

  const { message, code, error } =
    useActionData<GraphqlQueryErrorResult>() ?? {};

  return (
    <div className="max-w-3xl w-full flex flex-col gap-y-5">
      <h1 className="text-2xl text-center mb-4">Email Addresses</h1>
      {user.isVerified ? null : (
        <WarningAlert title="No verified emails">
          You do not have any verified email addresses, this will make account
          recovery impossible and may limit your available functionality within
          this application. Please complete email verification.
        </WarningAlert>
      )}
      <p>
        <strong>
          Account notices will be sent your primary email address.
        </strong>{" "}
        Additional email addresses may be added to help with account recovery
        (or to change your primary email), but they cannot be used until
        verified.
      </p>
      <div>
        {user.userEmails.nodes.map((email) => (
          <Email
            key={email.id}
            email={email}
            hasOtherEmails={user.userEmails.nodes.length > 1}
          />
        ))}
      </div>
      {!showAddEmailForm ? (
        <div>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddEmailForm(true)}
            data-cy="settingsemails-button-addemail"
          >
            Add email
          </button>
        </div>
      ) : (
        <AddEmailForm
          onComplete={() => setShowAddEmailForm(false)}
          message={message}
          code={code}
          error={error}
        />
      )}
    </div>
  );
}

interface AddEmailFormProps {
  onComplete: () => void;
  message?: string | null;
  code?: string | null;
  error?: true;
}

function AddEmailForm({ onComplete, error, code, message }: AddEmailFormProps) {
  return (
    <ValidatedForm
      validator={addEmailValidator}
      onSubmit={onComplete}
      method="post"
      subaction="add"
    >
      <AuthenticityTokenInput />
      <FormInput
        name="email"
        label="E-mail"
        required
        type="email"
        autoComplete="email"
        data-cy="settingsemails-input-email"
      />
      {error ? (
        <div className="alert alert-error">
          <span>
            <span className="text-xl">Error adding email</span>
            {message}
            {code ? (
              <span>
                {" "}
                (Error code: <code>ERR_{code}</code>)
              </span>
            ) : null}
          </span>
        </div>
      ) : null}
      <div className="flex justify-between">
        <SubmitButton data-cy="settingsemails-button-submit">
          Add email
        </SubmitButton>
        <div className="link link-secondary" onClick={() => onComplete()}>
          Cancel
        </div>
      </div>
    </ValidatedForm>
  );
}

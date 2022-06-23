import type { EmailsForm_UserEmailFragment } from "@app/graphql";
import { formItemLayout, getCodeFromError, tailFormItemLayout } from "@app/lib";
import { Form, useActionData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { withZod } from "@remix-validated-form/with-zod";
import { Alert, Avatar, Button, Form as AntForm, List, PageHeader } from "antd";
import { useState } from "react";
import { AuthenticityTokenInput } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import * as z from "zod";

import { P, Strong } from "~/components";
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

function Email({
  email,
  hasOtherEmails,
}: {
  email: EmailsForm_UserEmailFragment;
  hasOtherEmails: boolean;
}) {
  const canDelete = !email.isPrimary && hasOtherEmails;
  return (
    <List.Item
      data-cy={`settingsemails-emailitem-${email.email.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      )}`}
      key={email.id}
      actions={[
        email.isPrimary && (
          <span data-cy="settingsemails-indicator-primary">Primary</span>
        ),
        canDelete && (
          <Form style={{ display: "inline" }} method="post">
            <AuthenticityTokenInput />
            <input type="hidden" name="emailId" value={email.id} />
            <input type="hidden" name="subaction" value="delete" />
            <button type="submit" data-cy="settingsemails-button-delete">
              Delete
            </button>
          </Form>
        ),
        !email.isVerified && (
          <Form style={{ display: "inline" }} method="post">
            <AuthenticityTokenInput />
            <input type="hidden" name="emailId" value={email.id} />
            <input type="hidden" name="subaction" value="resend_verification" />
            <button type="submit">Resend verification</button>
          </Form>
        ),
        email.isVerified && !email.isPrimary && (
          <Form style={{ display: "inline" }} method="post">
            <AuthenticityTokenInput />
            <input type="hidden" name="emailId" value={email.id} />
            <input type="hidden" name="subaction" value="make_primary" />
            <button type="submit" data-cy="settingsemails-button-makeprimary">
              Make primary
            </button>
          </Form>
        ),
      ].filter((_) => _)}
    >
      <List.Item.Meta
        avatar={
          <Avatar size="large" style={{ backgroundColor: "transparent" }}>
            ✉️
          </Avatar>
        }
        title={
          <span>
            {" "}
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
                <small style={{ color: "red" }}>(unverified)</small>
              )}{" "}
            </span>{" "}
          </span>
        }
        description={`Added ${new Date(
          Date.parse(email.createdAt)
        ).toLocaleString()}`}
      />
    </List.Item>
  );
}

export default function ManageEmails() {
  const user = useLoaderDataTyped<typeof loader>();
  const [showAddEmailForm, setShowAddEmailForm] = useState(false);

  const { message, code, error } =
    useActionData<GraphqlQueryErrorResult>() ?? {};

  return (
    <div>
      {user.isVerified ? null : (
        <div style={{ marginBottom: "0.5rem" }}>
          <Alert
            type="warning"
            showIcon
            message="No verified emails"
            description={`
            You do not have any verified email addresses, this will make
            account recovery impossible and may limit your available
            functionality within this application. Please complete email
            verification.
            `}
          />
        </div>
      )}
      <PageHeader title="Email addresses" />
      <P>
        <Strong>
          Account notices will be sent your primary email address.
        </Strong>{" "}
        Additional email addresses may be added to help with account recovery
        (or to change your primary email), but they cannot be used until
        verified.
      </P>
      <List
        bordered
        size="large"
        dataSource={user.userEmails.nodes}
        renderItem={(email) => (
          <Email
            email={email}
            hasOtherEmails={user.userEmails.nodes.length > 1}
          />
        )}
        footer={
          !showAddEmailForm ? (
            <div>
              <Button
                type="primary"
                onClick={() => setShowAddEmailForm(true)}
                data-cy="settingsemails-button-addemail"
              >
                Add email
              </Button>
            </div>
          ) : (
            <AddEmailForm
              onComplete={() => setShowAddEmailForm(false)}
              message={message}
              code={code}
              error={error}
            />
          )
        }
      />
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
        {...formItemLayout}
      />
      {error ? (
        <AntForm.Item>
          <Alert
            type="error"
            message="Error adding email"
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
        </AntForm.Item>
      ) : null}
      <AntForm.Item {...tailFormItemLayout}>
        <SubmitButton type="primary" data-cy="settingsemails-button-submit">
          Add email
        </SubmitButton>
      </AntForm.Item>
    </ValidatedForm>
  );
}

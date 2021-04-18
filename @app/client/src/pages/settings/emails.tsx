import { ApolloError } from "@apollo/client";
import {
  ErrorAlert,
  P,
  Redirect,
  SettingsLayout,
  Strong,
} from "@app/components";
import {
  EmailsForm_UserEmailFragment,
  useAddEmailMutation,
  useDeleteEmailMutation,
  useMakeEmailPrimaryMutation,
  useResendEmailVerificationMutation,
  useSettingsEmailsQuery,
} from "@app/graphql";
import {
  extractError,
  formItemLayout,
  getCodeFromError,
  tailFormItemLayout,
} from "@app/lib";
import { Alert, Avatar, Button, Form, Input, List, PageHeader } from "antd";
import { useForm } from "antd/lib/form/Form";
import { NextPage } from "next";
import { Store } from "rc-field-form/lib/interface";
import React, { useCallback, useState } from "react";

function Email({
  email,
  hasOtherEmails,
}: {
  email: EmailsForm_UserEmailFragment;
  hasOtherEmails: boolean;
}) {
  const canDelete = !email.isPrimary && hasOtherEmails;
  const [deleteEmail] = useDeleteEmailMutation();
  const [resendEmailVerification] = useResendEmailVerificationMutation();
  const [makeEmailPrimary] = useMakeEmailPrimaryMutation();
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
          <a
            onClick={() => deleteEmail({ variables: { emailId: email.id } })}
            data-cy="settingsemails-button-delete"
          >
            Delete
          </a>
        ),
        !email.isVerified && (
          <a
            onClick={() =>
              resendEmailVerification({ variables: { emailId: email.id } })
            }
          >
            Resend verification
          </a>
        ),
        email.isVerified && !email.isPrimary && (
          <a
            onClick={() =>
              makeEmailPrimary({ variables: { emailId: email.id } })
            }
            data-cy="settingsemails-button-makeprimary"
          >
            Make primary
          </a>
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

const Settings_Emails: NextPage = () => {
  const [showAddEmailForm, setShowAddEmailForm] = useState(false);
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSettingsEmailsQuery();
  const { data, loading, error } = query;
  const user = data && data.currentUser;
  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!user && !loading) {
      return (
        <Redirect
          href={`/login?next=${encodeURIComponent("/settings/emails")}`}
        />
      );
    } else if (!user) {
      return "Loading";
    } else {
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
            Additional email addresses may be added to help with account
            recovery (or to change your primary email), but they cannot be used
            until verified.
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
                  error={formError}
                  setError={setFormError}
                />
              )
            }
          />
        </div>
      );
    }
  })();
  return (
    <SettingsLayout href="/settings/emails" query={query}>
      {pageContent}
    </SettingsLayout>
  );
};

export default Settings_Emails;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FormValues {
  email: string;
}

interface AddEmailFormProps {
  onComplete: () => void;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function AddEmailForm({ error, setError, onComplete }: AddEmailFormProps) {
  const [form] = useForm();
  const [addEmail] = useAddEmailMutation();
  const handleSubmit = useCallback(
    async (values: Store) => {
      try {
        setError(null);
        await addEmail({ variables: { email: values.email } });
        onComplete();
      } catch (e) {
        setError(e);
      }
    },
    [addEmail, onComplete, setError]
  );
  const code = getCodeFromError(error);
  return (
    <Form {...formItemLayout} form={form} onFinish={handleSubmit}>
      <Form.Item
        label="New email"
        name="email"
        rules={[
          {
            required: true,
            message: "Please enter an email address",
          },
        ]}
      >
        <Input data-cy="settingsemails-input-email" />
      </Form.Item>
      {error ? (
        <Form.Item>
          <Alert
            type="error"
            message={`Error adding email`}
            description={
              <span>
                {extractError(error).message}
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
      <Form.Item {...tailFormItemLayout}>
        <Button htmlType="submit" data-cy="settingsemails-button-submit">
          Add email
        </Button>
      </Form.Item>
    </Form>
  );
}

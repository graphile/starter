/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import React, { useState, useCallback, useMemo } from "react";
import { promisify } from "util";
import SettingsLayout from "../../components/SettingsLayout";
import {
  SettingsEmailsQueryComponent,
  withAddEmailMutation,
  AddEmailMutationMutationFn,
  EmailsForm_UserEmailFragmentFragment,
  ResendEmailVerificationMutationComponent,
  MakeEmailPrimaryMutationComponent,
  DeleteEmailMutationComponent,
} from "../../graphql";
import { Alert, List, Avatar, Form, Input, Button, Typography } from "antd";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { compose } from "react-apollo";
import { ApolloError } from "apollo-client";
import Redirect from "../../components/Redirect";
import { getCodeFromError, extractError } from "../../errors";

const { Text } = Typography;

function renderEmail(
  email: EmailsForm_UserEmailFragmentFragment,
  hasOtherEmails: boolean
) {
  const canDelete = !email.isPrimary && hasOtherEmails;
  return (
    <List.Item
      key={email.id}
      actions={[
        email.isPrimary && <span>Primary</span>,
        canDelete && (
          <DeleteEmailMutationComponent>
            {mutate => (
              <a onClick={() => mutate({ variables: { emailId: email.id } })}>
                Delete
              </a>
            )}
          </DeleteEmailMutationComponent>
        ),
        !email.isVerified && (
          <ResendEmailVerificationMutationComponent>
            {mutate => (
              <a onClick={() => mutate({ variables: { emailId: email.id } })}>
                Resend verification
              </a>
            )}
          </ResendEmailVerificationMutationComponent>
        ),
        email.isVerified && !email.isPrimary && (
          <MakeEmailPrimaryMutationComponent>
            {mutate => (
              <a onClick={() => mutate({ variables: { emailId: email.id } })}>
                Make primary
              </a>
            )}
          </MakeEmailPrimaryMutationComponent>
        ),
      ].filter(_ => _)}
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

export default function Settings_Emails() {
  const [showAddEmailForm, setShowAddEmailForm] = useState(false);
  const [error, setError] = useState<Error | ApolloError | null>(null);
  return (
    <SettingsLayout href="/settings/emails">
      <SettingsEmailsQueryComponent>
        {({ data, loading }) => {
          const user = data && data.currentUser;
          if (!user && !loading) {
            return <Redirect href={`/login?next=${"/settings/emails"}`} />;
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
                <h2>Email addresses</h2>
                <p>
                  <Text strong>
                    Account notices will be sent your your primary email
                    address.
                  </Text>{" "}
                  Additional email addresses may be added to help with account
                  recovery (or to change your primary email), but they cannot be
                  used until verified.
                </p>
                <List
                  dataSource={user.userEmails.nodes}
                  renderItem={email =>
                    renderEmail(email, user.userEmails.nodes.length > 1)
                  }
                />
                {!showAddEmailForm ? (
                  <div>
                    <Button
                      type="primary"
                      onClick={() => setShowAddEmailForm(true)}
                    >
                      Add email
                    </Button>
                  </div>
                ) : (
                  <WrappedAddEmailForm
                    onComplete={() => setShowAddEmailForm(false)}
                    error={error}
                    setError={setError}
                  />
                )}
              </div>
            );
          }
        }}
      </SettingsEmailsQueryComponent>
    </SettingsLayout>
  );
}

interface FormValues {
  email: string;
}

interface AddEmailFormProps extends FormComponentProps<FormValues> {
  addEmail: AddEmailMutationMutationFn;
  onComplete: () => void;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function AddEmailForm({
  addEmail,
  form,
  error,
  setError,
  onComplete,
}: AddEmailFormProps) {
  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFields(...args)),
    [form]
  );
  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();
      try {
        setError(null);
        const values = await validateFields();
        await addEmail({ variables: { email: values.email } });
        onComplete();
      } catch (e) {
        setError(e);
      }
    },
    [addEmail, onComplete, setError, validateFields]
  );
  const { getFieldDecorator } = form;
  const code = getCodeFromError(error);
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Item label="New email">
        {getFieldDecorator("email", {
          initialValue: "",
          rules: [
            {
              required: true,
              message: "Please choose a username",
            },
          ],
        })(<Input />)}
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
      <Form.Item>
        <Button htmlType="submit">Add email</Button>
      </Form.Item>
    </Form>
  );
}

const WrappedAddEmailForm = compose(
  Form.create<AddEmailFormProps>({
    name: "addEmailForm",
    onValuesChange(props) {
      props.setError(null);
    },
  }),
  withAddEmailMutation({ name: "addEmail" })
)(AddEmailForm);

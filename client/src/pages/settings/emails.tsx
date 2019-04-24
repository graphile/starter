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
import { Alert, List, Avatar, Form, Input, Button } from "antd";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { compose } from "react-apollo";
import { ApolloError } from "apollo-client";
import Redirect from "../../components/Redirect";
import { getCodeFromError, extractError } from "../../errors";

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

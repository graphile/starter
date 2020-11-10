import {
  ErrorAlert,
  P,
  PasswordStrength,
  SettingsLayout,
} from "@app/components";
import {
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useSettingsPasswordQuery,
  useSharedQuery,
} from "@app/graphql";
import {
  extractError,
  formItemLayout,
  getCodeFromError,
  setPasswordInfo,
  tailFormItemLayout,
} from "@app/lib";
import { Alert, Button, Form, Input, PageHeader } from "antd";
import { useForm } from "antd/lib/form/Form";
import { ApolloError } from "apollo-client";
import { NextPage } from "next";
import Link from "next/link";
import { Store } from "rc-field-form/lib/interface";
import React, { useCallback, useState } from "react";

const Settings_Security: NextPage = () => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);

  const query = useSharedQuery();

  const [form] = useForm();
  const [changePassword] = useChangePasswordMutation();
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (values: Store) => {
      setSuccess(false);
      setError(null);
      try {
        await changePassword({
          variables: {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
          },
        });
        setError(null);
        setSuccess(true);
      } catch (e) {
        const errcode = getCodeFromError(e);
        if (errcode === "WEAKP") {
          form.setFields([
            {
              name: "newPassword",
              value: form.getFieldValue("newPassword"),
              errors: [
                "The server believes this passphrase is too weak, please make it stronger",
              ],
            },
          ]);
        } else if (errcode === "CREDS") {
          form.setFields([
            {
              name: "oldPassword",
              value: form.getFieldValue("oldPassword"),
              errors: ["Incorrect old passphrase"],
            },
          ]);
        } else {
          setError(e);
        }
      }
    },
    [changePassword, form, setError]
  );

  const {
    data,
    error: graphqlQueryError,
    loading,
  } = useSettingsPasswordQuery();
  const [forgotPassword] = useForgotPasswordMutation();
  const u = data && data.currentUser;
  const userEmail = u && u.userEmails.nodes[0];
  const email = userEmail ? userEmail.email : null;
  const [resetInProgress, setResetInProgress] = useState(false);
  const [resetError, setResetError] = useState(null);
  const handleResetPassword = useCallback(() => {
    if (!email) return;
    if (resetInProgress) return;
    (async () => {
      setResetInProgress(true);

      try {
        await forgotPassword({ variables: { email } });
      } catch (e) {
        setResetError(resetError);
      }
      setResetInProgress(false);
    })();
  }, [email, forgotPassword, resetError, resetInProgress]);

  const [passwordIsFocussed, setPasswordIsFocussed] = useState(false);
  const setPasswordFocussed = useCallback(() => {
    setPasswordIsFocussed(true);
  }, [setPasswordIsFocussed]);
  const setPasswordNotFocussed = useCallback(() => {
    setPasswordIsFocussed(false);
  }, [setPasswordIsFocussed]);
  const [passwordIsDirty, setPasswordIsDirty] = useState(false);
  const handleValuesChange = useCallback(
    (changedValues) => {
      setPasswordInfo(
        { setPasswordStrength, setPasswordSuggestions },
        changedValues,
        "newPassword"
      );
      setPasswordIsDirty(form.isFieldTouched("password"));
    },
    [form]
  );

  const inner = () => {
    if (loading) {
      /* noop */
    } else if (graphqlQueryError) {
      return <ErrorAlert error={graphqlQueryError} />;
    } else if (data && data.currentUser && !data.currentUser.hasPassword) {
      return (
        <div>
          <PageHeader title="Change passphrase" />
          <P>
            You registered your account through social login, so you do not
            currently have a passphrase. If you would like a passphrase, press
            the button below to request a passphrase reset email to '{email}'
            (you can choose a different email by making it primary in{" "}
            <Link href="/settings/emails">email settings</Link>).
          </P>
          <Button onClick={handleResetPassword} disabled={resetInProgress}>
            Reset passphrase
          </Button>
        </div>
      );
    }

    const code = getCodeFromError(error);
    return (
      <div>
        <PageHeader title="Change passphrase" />
        <Form
          {...formItemLayout}
          form={form}
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            label="Old passphrase"
            name="oldPassword"
            rules={[
              {
                required: true,
                message: "Please input your passphrase",
              },
            ]}
          >
            <Input type="password" />
          </Form.Item>
          <Form.Item label="New passphrase" required>
            <Form.Item
              noStyle
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Please confirm your passphrase",
                },
              ]}
            >
              <Input
                type="password"
                onFocus={setPasswordFocussed}
                onBlur={setPasswordNotFocussed}
              />
            </Form.Item>
            <PasswordStrength
              passwordStrength={passwordStrength}
              suggestions={passwordSuggestions}
              isDirty={passwordIsDirty}
              isFocussed={passwordIsFocussed}
            />
          </Form.Item>
          {error ? (
            <Form.Item>
              <Alert
                type="error"
                message={`Changing passphrase failed`}
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
          ) : success ? (
            <Form.Item>
              <Alert type="success" message={`Password changed!`} />
            </Form.Item>
          ) : null}
          <Form.Item {...tailFormItemLayout}>
            <Button htmlType="submit">Change Passphrase</Button>
          </Form.Item>
        </Form>
      </div>
    );
  };
  return (
    <SettingsLayout href="/settings/security" query={query}>
      {inner()}
    </SettingsLayout>
  );
};

export default Settings_Security;

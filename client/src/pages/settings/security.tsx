import React, { useState, useCallback, useMemo, SyntheticEvent } from "react";
import SettingsLayout from "../../components/SettingsLayout";
import {
  withChangePasswordMutation,
  ChangePasswordMutationMutationFn,
} from "../../graphql";
import { promisify } from "util";
import { Form, Input, Alert, Button } from "antd";
import { compose } from "react-apollo";
import { ApolloError } from "apollo-client";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { getCodeFromError, extractError } from "../../errors";
import { formItemLayout, tailFormItemLayout } from "../../forms";

export default function Settings_Security() {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  return (
    <SettingsLayout href="/settings/security">
      <WrappedChangePasswordForm error={error} setError={setError} />
    </SettingsLayout>
  );
}

/**
 * These are the values in our form
 */
interface FormValues {
  oldPassword: string;
  newPassword: string;
}

interface ChangePasswordFormProps extends FormComponentProps<FormValues> {
  changePassword: ChangePasswordMutationMutationFn;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function ChangePasswordForm({
  changePassword,
  form,
  error,
  setError,
}: ChangePasswordFormProps) {
  const [success, setSuccess] = useState(false);
  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFields(...args)),
    [form]
  );

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      setSuccess(false);
      setError(null);
      try {
        const values = await validateFields();
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
          form.setFields({
            newPassword: {
              value: form.getFieldValue("newPassword"),
              errors: [
                new Error(
                  "The server believes this password is too weak, please make it stronger"
                ),
              ],
            },
          });
        } else if (errcode === "CREDS") {
          form.setFields({
            oldPassword: {
              value: form.getFieldValue("oldPassword"),
              errors: [new Error("Incorrect old password")],
            },
          });
        } else {
          setError(e);
        }
      }
    },
    [changePassword, form, setError, validateFields]
  );

  const { getFieldDecorator } = form;

  const code = getCodeFromError(error);
  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item label="Old Password">
        {getFieldDecorator("oldPassword", {
          rules: [
            {
              required: true,
              message: "Please input your password",
            },
          ],
        })(<Input type="password" />)}
      </Form.Item>
      <Form.Item label="New Password">
        {getFieldDecorator("newPassword", {
          rules: [
            {
              required: true,
              message: "Please confirm your password",
            },
          ],
        })(<Input type="password" />)}
      </Form.Item>
      {error ? (
        <Form.Item>
          <Alert
            type="error"
            message={`Changing password failed`}
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
        <Button htmlType="submit">Change Password</Button>
      </Form.Item>
    </Form>
  );
}

const WrappedChangePasswordForm = compose(
  Form.create<ChangePasswordFormProps>({
    name: "changePasswordForm",
    onValuesChange(props) {
      props.setError(null);
    },
  }),
  withChangePasswordMutation({ name: "changePassword" })
)(ChangePasswordForm);

import React, { useState, useCallback, useMemo, SyntheticEvent } from "react";
import SettingsLayout from "../../layout/SettingsLayout";
import { NextPage } from "next";
import {
  useUpdateUserMutation,
  useSettingsProfileQuery,
  ProfileSettingsForm_UserFragment,
} from "@app/graphql";
import { promisify } from "util";
import { Form, Input, Alert, Button } from "antd";
import { ApolloError } from "apollo-client";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { getCodeFromError, extractError } from "../../errors";
import { formItemLayout, tailFormItemLayout } from "../../forms";
import { Redirect, ErrorAlert, H3 } from "@app/components";

const Settings_Profile: NextPage = () => {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const { data, loading, error } = useSettingsProfileQuery();
  return (
    <SettingsLayout href="/settings">
      {data && data.currentUser ? (
        <WrappedProfileSettingsForm
          error={formError}
          setError={setFormError}
          user={data.currentUser}
        />
      ) : loading ? (
        "Loading..."
      ) : error ? (
        <ErrorAlert error={error} />
      ) : (
        <Redirect href={`/login?next=${encodeURIComponent("/settings")}`} />
      )}
    </SettingsLayout>
  );
};

export default Settings_Profile;

/**
 * These are the values in our form
 */
interface FormValues {
  username: string;
  name: string;
}

interface ProfileSettingsFormProps extends FormComponentProps<FormValues> {
  user: ProfileSettingsForm_UserFragment;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function ProfileSettingsForm({
  user,
  form,
  error,
  setError,
}: ProfileSettingsFormProps) {
  const [updateUser] = useUpdateUserMutation();
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
        await updateUser({
          variables: {
            id: user.id,
            patch: {
              username: values.username,
              name: values.name,
            },
          },
        });
        setError(null);
        setSuccess(true);
      } catch (e) {
        const errcode = getCodeFromError(e);
        if (errcode === "23505") {
          form.setFields({
            username: {
              value: form.getFieldValue("username"),
              errors: [
                new Error(
                  "This username is already in use, please pick a different name"
                ),
              ],
            },
          });
        } else {
          setError(e);
        }
      }
    },
    [setError, validateFields, updateUser, user.id, form]
  );

  const { getFieldDecorator } = form;

  const code = getCodeFromError(error);
  return (
    <div>
      <H3>Edit Profile</H3>
      <Form {...formItemLayout} onSubmit={handleSubmit}>
        <Form.Item label="Name">
          {getFieldDecorator("name", {
            initialValue: user.name,
            rules: [
              {
                required: true,
                message: "Please enter your name",
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Username">
          {getFieldDecorator("username", {
            initialValue: user.username,
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
              message={`Updating username`}
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
            <Alert type="success" message={`Profile updated`} />
          </Form.Item>
        ) : null}
        <Form.Item {...tailFormItemLayout}>
          <Button htmlType="submit">Update Profile</Button>
        </Form.Item>
      </Form>
    </div>
  );
}

const WrappedProfileSettingsForm = Form.create<ProfileSettingsFormProps>({
  name: "updateUserForm",
  onValuesChange(props) {
    props.setError(null);
  },
})(ProfileSettingsForm);

"use client";
import { PageHeader } from "@ant-design/pro-layout";
import { ApolloError } from "@apollo/client";
import { ErrorAlert, Redirect, SettingsLayout } from "@/appcomponents";
import {
  ProfileSettingsForm_UserFragment,
  useSettingsProfileQuery,
  useUpdateUserMutation,
} from "@/appgraphqlgenerated";
import {
  extractError,
  formItemLayout,
  getCodeFromError,
  tailFormItemLayout,
} from "@/applib";
import { Alert, Button, Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import { Store } from "rc-field-form/lib/interface";
import React, { Suspense, useCallback, useState } from "react";

export default function Settings_ProfileWrapper() {
  return (
    <Suspense>
      <Settings_Profile />
    </Suspense>
  );
}

function Settings_Profile() {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSettingsProfileQuery();
  const { data, loading, error } = query;
  return (
    <SettingsLayout href="/settings" query={query}>
      {data && data.currentUser ? (
        <ProfileSettingsForm
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
}

/**
 * These are the values in our form
 */
interface FormValues {
  username: string;
  name: string;
}

interface ProfileSettingsFormProps {
  user: ProfileSettingsForm_UserFragment;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function ProfileSettingsForm({
  user,
  error,
  setError,
}: ProfileSettingsFormProps) {
  const [form] = useForm<FormValues>();
  const [updateUser] = useUpdateUserMutation();
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (values: Store) => {
      setSuccess(false);
      setError(null);
      try {
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
      } catch (e: any) {
        const errcode = getCodeFromError(e);
        if (errcode === "NUNIQ") {
          form.setFields([
            {
              name: "username",
              value: form.getFieldValue("username"),
              errors: [
                "This username is already in use, please pick a different name",
              ],
            },
          ]);
        } else {
          setError(e);
        }
      }
    },
    [setError, updateUser, user.id, form]
  );

  const code = getCodeFromError(error);
  return (
    <div>
      <PageHeader title="Edit profile" />
      <Form
        {...formItemLayout}
        form={form}
        onFinish={handleSubmit}
        initialValues={{ name: user.name, username: user.username }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter your name",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: "Please choose a username",
            },
          ]}
        >
          <Input />
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

import { UserOutlined } from "@ant-design/icons";
import { SharedLayout } from "@app/components";
import { useForgotPasswordMutation, useSharedQuery } from "@app/graphql";
import { extractError, getCodeFromError } from "@app/lib";
import { Alert, Button, Form, Input } from "antd";
import { useForm } from "antd/lib/form/util";
import { ApolloError } from "apollo-client";
import { NextPage } from "next";
import Link from "next/link";
import { Store } from "rc-field-form/lib/interface";
import React, { useCallback, useEffect, useRef, useState } from "react";

const ForgotPassword: NextPage = () => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const query = useSharedQuery();

  const [form] = useForm();
  const [forgotPassword] = useForgotPasswordMutation();
  const [successfulEmail, setSuccessfulEmail] = useState<string | null>(null);

  const handleSubmit = useCallback(
    (values: Store): void => {
      setError(null);
      (async () => {
        try {
          const email = values.email;
          await forgotPassword({
            variables: {
              email,
            },
          });
          // Success: refetch
          setSuccessfulEmail(email);
        } catch (e) {
          setError(e);
        }
      })();
    },
    [forgotPassword, setError]
  );

  const focusElement = useRef<Input>(null);
  useEffect(
    () => void (focusElement.current && focusElement.current!.focus()),
    [focusElement]
  );

  const { getFieldError, isFieldTouched } = form;

  // Only show error after a field is touched.
  const emailError = isFieldTouched("email") && getFieldError("email");

  const code = getCodeFromError(error);

  if (successfulEmail != null) {
    return (
      <Alert
        type="success"
        message="You've got mail"
        description={`We've sent an email reset link to '${successfulEmail}'; click the link and follow the instructions. If you don't receive the link, please ensure you entered the email address correctly, and check in your spam folder just in case.`}
      />
    );
  }

  return (
    <SharedLayout title="Forgot Password" query={query}>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          validateStatus={emailError ? "error" : ""}
          help={emailError || ""}
          name="email"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail",
            },
            { required: true, message: "Please input your email" },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="Email"
            ref={focusElement}
          />
        </Form.Item>

        {error ? (
          <Form.Item>
            <Alert
              type="error"
              message={`Something went wrong`}
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
          <Button type="primary" htmlType="submit">
            Reset password
          </Button>
        </Form.Item>
        <Form.Item>
          <p>
            <Link href="/login">
              <a>Remembered your password? Log in.</a>
            </Link>
          </p>
        </Form.Item>
      </Form>
    </SharedLayout>
  );
};

export default ForgotPassword;

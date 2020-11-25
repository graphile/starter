import { QuestionCircleOutlined } from "@ant-design/icons";
import { useApolloClient } from "@apollo/react-hooks";
import {
  AuthRestrict,
  PasswordStrength,
  Redirect,
  SharedLayout,
} from "@app/components";
import { useRegisterMutation, useSharedQuery } from "@app/graphql";
import {
  extractError,
  formItemLayout,
  getCodeFromError,
  getExceptionFromError,
  resetWebsocketConnection,
  setPasswordInfo,
  tailFormItemLayout,
} from "@app/lib";
import { Alert, Button, Form, Input, Tooltip } from "antd";
import { useForm } from "antd/lib/form/Form";
import { ApolloError } from "apollo-client";
import { NextPage } from "next";
import Router from "next/router";
import { Store } from "rc-field-form/lib/interface";
import React, {
  FocusEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { isSafe } from "./login";

interface RegisterProps {
  next: string | null;
}

/**
 * The registration page just renders the standard layout and embeds the
 * registration form.
 */
const Register: NextPage<RegisterProps> = ({ next: rawNext }) => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);
  const next: string = isSafe(rawNext) ? rawNext! : "/";
  const query = useSharedQuery();

  const [register] = useRegisterMutation({});
  const client = useApolloClient();
  const [confirmDirty, setConfirmDirty] = useState(false);
  const [form] = useForm();

  const handleSubmit = useCallback(
    async (values: Store) => {
      try {
        await register({
          variables: {
            username: values.username,
            email: values.email,
            password: values.password,
            name: values.name,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        client.resetStore();
        Router.push(next);
      } catch (e) {
        const code = getCodeFromError(e);
        const exception = getExceptionFromError(e);
        const fields: any = exception && exception["fields"];
        if (code === "WEAKP") {
          form.setFields([
            {
              name: "password",
              value: form.getFieldValue("password"),
              errors: [
                "The server believes this passphrase is too weak, please make it stronger",
              ],
            },
          ]);
        } else if (code === "EMTKN") {
          form.setFields([
            {
              name: "email",
              value: form.getFieldValue("email"),
              errors: [
                "An account with this email address has already been registered, consider using the 'Forgot passphrase' function.",
              ],
            },
          ]);
        } else if (code === "NUNIQ" && fields && fields[0] === "username") {
          form.setFields([
            {
              name: "username",
              value: form.getFieldValue("username"),
              errors: [
                "An account with this username has already been registered, please try a different username.",
              ],
            },
          ]);
        } else if (code === "23514") {
          form.setFields([
            {
              name: "username",
              value: form.getFieldValue("username"),
              errors: [
                "This username is not allowed; usernames must be between 2 and 24 characters long (inclusive), must start with a letter, and must contain only alphanumeric characters and underscores.",
              ],
            },
          ]);
        } else {
          setError(e);
        }
      }
    },
    [form, register, client, next]
  );

  const handleConfirmBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setConfirmDirty(confirmDirty || !!value);
    },
    [setConfirmDirty, confirmDirty]
  );

  const compareToFirstPassword = useCallback(
    async (_rule: any, value: any) => {
      if (value && value !== form.getFieldValue("password")) {
        throw "Make sure your passphrase is the same in both passphrase boxes.";
      }
    },
    [form]
  );

  const focusElement = useRef<Input>(null);
  useEffect(
    () => void (focusElement.current && focusElement.current!.focus()),
    [focusElement]
  );

  const [passwordIsFocussed, setPasswordIsFocussed] = useState(false);
  const [passwordIsDirty, setPasswordIsDirty] = useState(false);
  const setPasswordFocussed = useCallback(() => {
    setPasswordIsFocussed(true);
  }, [setPasswordIsFocussed]);
  const setPasswordNotFocussed = useCallback(() => {
    setPasswordIsFocussed(false);
  }, [setPasswordIsFocussed]);
  const handleValuesChange = useCallback(
    (changedValues) => {
      setPasswordInfo(
        { setPasswordStrength, setPasswordSuggestions },
        changedValues
      );
      setPasswordIsDirty(form.isFieldTouched("password"));
      if (changedValues.confirm) {
        if (form.isFieldTouched("password")) {
          form.validateFields(["password"]);
        }
      } else if (changedValues.password) {
        if (form.isFieldTouched("confirm")) {
          form.validateFields(["confirm"]);
        }
      }
    },
    [form]
  );

  const code = getCodeFromError(error);
  return (
    <SharedLayout
      title="Register"
      query={query}
      forbidWhen={AuthRestrict.LOGGED_IN}
    >
      {({ currentUser }) =>
        currentUser ? (
          <Redirect href={next} />
        ) : (
          <Form
            {...formItemLayout}
            form={form}
            onFinish={handleSubmit}
            onValuesChange={handleValuesChange}
          >
            <Form.Item
              label={
                <span data-cy="registerpage-name-label">
                  Name&nbsp;
                  <Tooltip title="What is your name?">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please input your name.",
                  whitespace: true,
                },
              ]}
            >
              <Input
                ref={focusElement}
                autoComplete="name"
                data-cy="registerpage-input-name"
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Username&nbsp;
                  <Tooltip title="What do you want others to call you?">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username.",
                  whitespace: true,
                },
                {
                  min: 2,
                  message: "Username must be at least 2 characters long.",
                },
                {
                  max: 24,
                  message: "Username must be no more than 24 characters long.",
                },
                {
                  pattern: /^([a-zA-Z]|$)/,
                  message: "Username must start with a letter.",
                },
                {
                  pattern: /^([^_]|_[^_]|_$)*$/,
                  message:
                    "Username must not contain two underscores next to each other.",
                },
                {
                  pattern: /^[a-zA-Z0-9_]*$/,
                  message:
                    "Username must contain only alphanumeric characters and underscores.",
                },
              ]}
            >
              <Input
                autoComplete="username"
                data-cy="registerpage-input-username"
              />
            </Form.Item>
            <Form.Item
              label="E-mail"
              name="email"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail.",
                },
                {
                  required: true,
                  message: "Please input your E-mail.",
                },
              ]}
            >
              <Input data-cy="registerpage-input-email" />
            </Form.Item>
            <Form.Item label="Passphrase" required>
              <Form.Item
                noStyle
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your passphrase.",
                  },
                ]}
              >
                <Input
                  type="password"
                  autoComplete="new-password"
                  data-cy="registerpage-input-password"
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
            <Form.Item
              label="Confirm passphrase"
              name="confirm"
              rules={[
                {
                  required: true,
                  message: "Please confirm your passphrase.",
                },
                {
                  validator: compareToFirstPassword,
                },
              ]}
            >
              <Input
                type="password"
                autoComplete="new-password"
                onBlur={handleConfirmBlur}
                data-cy="registerpage-input-password2"
              />
            </Form.Item>
            {error ? (
              <Form.Item label="Error">
                <Alert
                  type="error"
                  message={`Registration failed`}
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
              <Button htmlType="submit" data-cy="registerpage-submit-button">
                Register
              </Button>
            </Form.Item>
          </Form>
        )
      }
    </SharedLayout>
  );
};
Register.getInitialProps = async ({ query }) => ({
  next: typeof query.next === "string" ? query.next : null,
});

export default Register;

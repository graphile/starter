import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  FocusEvent,
} from "react";
import SharedLayout from "../layout/SharedLayout";
import { NextPage } from "next";
import { useApolloClient } from "@apollo/react-hooks";
import { useRegisterMutation } from "@app/graphql";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { Form, Input, Tooltip, Icon, Button, Alert } from "antd";
import { SyntheticEvent } from "react";
import { promisify } from "util";
import Router from "next/router";
import { ApolloError } from "apollo-client";
import {
  getCodeFromError,
  getExceptionFromError,
  extractError,
} from "../errors";
import { formItemLayout, tailFormItemLayout } from "../forms";
import { resetWebsocketConnection } from "../lib/withApollo";

/**
 * The registration page just renders the standard layout and embeds the
 * registration form.
 */
const Register: NextPage = () => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  return (
    <SharedLayout title="Register">
      <WrappedRegistrationForm
        onSuccessRedirectTo="/"
        error={error}
        setError={setError}
      />
    </SharedLayout>
  );
};

export default Register;

/**
 * These are the values in our form
 */
interface FormValues {
  name: string;
  username: string;
  email: string;
  password: string;
  confirm: string;
}

/**
 * Our registration form receives our `register` mutation (see
 * `withRegisterMutation` below), and all the Form.create enhancements from
 * Antd.
 */
interface RegistrationFormProps extends FormComponentProps<FormValues> {
  onSuccessRedirectTo: string;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

/**
 * This component is responsible for rendering the registration form, and
 * handling all the related events (e.g. form submit).
 *
 * On successful registration it will redirect to the path specified in
 * 'onSuccessRedirectTo'.
 */
function RegistrationForm({
  form,
  onSuccessRedirectTo,
  error,
  setError,
}: RegistrationFormProps) {
  const [register] = useRegisterMutation({});
  const client = useApolloClient();
  const [confirmDirty, setConfirmDirty] = useState(false);

  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFields(...args)),
    [form]
  );

  const validateFieldsAndScroll: () => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFieldsAndScroll(...args)),
    [form]
  );

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      try {
        const values = await validateFieldsAndScroll();
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
        Router.push(onSuccessRedirectTo);
      } catch (e) {
        const code = getCodeFromError(e);
        const exception = getExceptionFromError(e);
        const fields: any = exception && exception["fields"];
        if (code === "WEAKP") {
          form.setFields({
            password: {
              value: form.getFieldValue("password"),
              errors: [
                new Error(
                  "The server believes this password is too weak, please make it stronger"
                ),
              ],
            },
          });
        } else if (code === "EMTKN") {
          form.setFields({
            email: {
              value: form.getFieldValue("email"),
              errors: [
                new Error(
                  "An account with this email address has already been registered, consider using the 'Forgot Password' function."
                ),
              ],
            },
          });
        } else if (code === "NUNIQ" && fields && fields[0] === "username") {
          form.setFields({
            username: {
              value: form.getFieldValue("username"),
              errors: [
                new Error(
                  "An account with this username has already been registered, please try a different username."
                ),
              ],
            },
          });
        } else if (code === "23514") {
          form.setFields({
            username: {
              value: form.getFieldValue("username"),
              errors: [
                new Error(
                  "This username is not allowed; usernames must be between 2 and 24 characters long (inclusive), must start with a letter, and must contain only alphanumeric characters and underscores."
                ),
              ],
            },
          });
        } else {
          setError(e);
        }
      }
    },
    [
      validateFieldsAndScroll,
      register,
      client,
      onSuccessRedirectTo,
      form,
      setError,
    ]
  );

  const handleConfirmBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setConfirmDirty(confirmDirty || !!value);
    },
    [setConfirmDirty, confirmDirty]
  );

  const validateToNextPassword = useCallback(
    async (_rule: any, value: any, callback: any) => {
      try {
        if (value && confirmDirty) {
          await validateFields(["confirm"], { force: true });
        }
      } catch (e) {
        // Handled elsewhere
      }
      callback();
    },
    [confirmDirty, validateFields]
  );

  const compareToFirstPassword = useCallback(
    (_rule: any, value: any, callback: any) => {
      if (value && value !== form.getFieldValue("password")) {
        callback("Make sure your password is the same in both Password boxes.");
      } else {
        callback();
      }
    },
    [form]
  );

  const focusElement = useRef<Input>(null);
  useEffect(
    () => void (focusElement.current && focusElement.current!.focus()),
    [focusElement]
  );

  const { getFieldDecorator } = form;

  const code = getCodeFromError(error);
  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item
        label={
          <span data-cy="registerpage-name-label">
            Name&nbsp;
            <Tooltip title="What is your name?">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator("name", {
          rules: [
            {
              required: true,
              message: "Please input your name.",
              whitespace: true,
            },
          ],
        })(<Input ref={focusElement} data-cy="registerpage-input-name" />)}
      </Form.Item>
      <Form.Item
        label={
          <span>
            Username&nbsp;
            <Tooltip title="What do you want others to call you?">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator("username", {
          rules: [
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
          ],
        })(<Input data-cy="registerpage-input-username" />)}
      </Form.Item>
      <Form.Item label="E-mail">
        {getFieldDecorator("email", {
          rules: [
            {
              type: "email",
              message: "The input is not valid E-mail.",
            },
            {
              required: true,
              message: "Please input your E-mail.",
            },
          ],
        })(<Input data-cy="registerpage-input-email" />)}
      </Form.Item>
      <Form.Item label="Password">
        {getFieldDecorator("password", {
          rules: [
            {
              required: true,
              message: "Please input your password.",
            },
            {
              validator: validateToNextPassword,
            },
          ],
        })(<Input type="password" data-cy="registerpage-input-password" />)}
      </Form.Item>
      <Form.Item label="Confirm Password">
        {getFieldDecorator("confirm", {
          rules: [
            {
              required: true,
              message: "Please confirm your password.",
            },
            {
              validator: compareToFirstPassword,
            },
          ],
        })(
          <Input
            type="password"
            onBlur={handleConfirmBlur}
            data-cy="registerpage-input-password2"
          />
        )}
      </Form.Item>
      {error ? (
        <Form.Item>
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
  );
}

const WrappedRegistrationForm = Form.create<RegistrationFormProps>({
  name: "registerform",
  onValuesChange(props) {
    props.setError(null);
  },
})(RegistrationForm);

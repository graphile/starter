import React, {
  useRef,
  useEffect,
  FormEvent,
  useMemo,
  useCallback,
} from "react";
import SharedLayout, { Row, Col } from "../components/SharedLayout";
import Link from "next/link";
import { Form, Icon, Input, Button } from "antd";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { promisify } from "util";
import { compose, withApollo, WithApolloClient } from "react-apollo";
import { withLoginMutation, LoginMutationMutationFn } from "../graphql";
import Router from "next/router";

function hasErrors(fieldsError: Object) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

/**
 * Login page just renders the standard layout and embeds the login form
 */
export default function Login() {
  return (
    <SharedLayout title="Login">
      <WrappedLoginForm onSuccessRedirectTo="/" />
    </SharedLayout>
  );
}

interface FormValues {
  username: string;
  password: string;
}

interface LoginFormProps extends FormComponentProps<FormValues> {
  login: LoginMutationMutationFn;
  onSuccessRedirectTo: string;
}

function LoginForm({
  form,
  client,
  login,
  onSuccessRedirectTo,
}: WithApolloClient<LoginFormProps>) {
  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify(form.validateFields.bind(form)),
    [form]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      try {
        const values = await validateFields();
        await login({
          variables: {
            username: values.username,
            password: values.password,
          },
        });
        // Success: refetch
        client.resetStore();
        Router.push(onSuccessRedirectTo);
      } catch (e) {
        console.error(e);
      }
    },
    [client, login, onSuccessRedirectTo, validateFields]
  );

  const focusElement = useRef<Input>(null);
  useEffect(
    () => void (focusElement.current && focusElement.current!.focus()),
    [focusElement]
  );

  const {
    getFieldDecorator,
    getFieldsError,
    getFieldError,
    isFieldTouched,
  } = form;

  // Only show error after a field is touched.
  const userNameError = isFieldTouched("username") && getFieldError("username");
  const passwordError = isFieldTouched("password") && getFieldError("password");
  return (
    <Form layout="inline" onSubmit={handleSubmit}>
      <Row>
        <Col>
          <span>
            New user?{" "}
            <Link href="/register">
              <a>Register Here</a>
            </Link>
          </span>
        </Col>
      </Row>
      <Form.Item
        validateStatus={userNameError ? "error" : ""}
        help={userNameError || ""}
      >
        {getFieldDecorator("username", {
          rules: [{ required: true, message: "Please input your username" }],
        })(
          <Input
            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="Username"
            ref={focusElement}
          />
        )}
      </Form.Item>
      <Form.Item
        validateStatus={passwordError ? "error" : ""}
        help={passwordError || ""}
      >
        {getFieldDecorator("password", {
          rules: [{ required: true, message: "Please input your Password" }],
        })(
          <Input
            prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
            type="password"
            placeholder="Password"
          />
        )}
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          disabled={hasErrors(getFieldsError())}
        >
          Log in
        </Button>
      </Form.Item>
    </Form>
  );
}

const WrappedLoginForm = compose(
  Form.create({ name: "horizontal_login" }),
  withLoginMutation({ name: "login" }),
  withApollo
)(LoginForm);

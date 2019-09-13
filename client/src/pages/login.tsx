import React, {
  useRef,
  useEffect,
  FormEvent,
  useMemo,
  useCallback,
  useState,
} from "react";
import SharedLayout, {
  Row,
  Col,
  SharedLayoutChildProps,
} from "../components/SharedLayout";
import { NextPageContext } from "next";
import Link from "next/link";
import { Divider, Form, Icon, Input, Button, Alert } from "antd";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { promisify } from "util";
import { useApolloClient } from "@apollo/react-hooks";
import { useLoginMutation } from "../graphql";
import Router from "next/router";
import { ApolloError } from "apollo-client";
import { getCodeFromError, extractError } from "../errors";
import Redirect from "../components/Redirect";
import SocialLoginOptions from "../components/SocialLoginOptions";

function hasErrors(fieldsError: Object) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

interface LoginProps {
  next?: string;
}

function isSafe(nextUrl: string | void | null) {
  return (nextUrl && nextUrl[0] === "/") || false;
}

/**
 * Login page just renders the standard layout and embeds the login form
 */
export default function Login({ next: rawNext }: LoginProps) {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const next: string = isSafe(rawNext) ? rawNext! : "/";
  return (
    <SharedLayout title="Login">
      {({ currentUser }: SharedLayoutChildProps) =>
        currentUser ? (
          <Redirect href={next} />
        ) : (
          <div>
            <WrappedLoginForm
              onSuccessRedirectTo={next}
              error={error}
              setError={setError}
            />
            <Divider />
            <Row>
              <Col span={12} offset={6}>
                <div style={{ textAlign: "center" }}>
                  <p>Alternatively, you can use social login:</p>
                  <SocialLoginOptions next={next} />
                </div>
              </Col>
            </Row>
          </div>
        )
      }
    </SharedLayout>
  );
}

Login.getInitialProps = ({ query }: NextPageContext) => {
  return {
    next: query.next,
  };
};

interface FormValues {
  username: string;
  password: string;
}

interface LoginFormProps extends FormComponentProps<FormValues> {
  onSuccessRedirectTo: string;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function LoginForm({
  form,
  onSuccessRedirectTo,
  error,
  setError,
}: LoginFormProps) {
  const [login] = useLoginMutation();
  const client = useApolloClient();
  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFields(...args)),
    [form]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
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
        setError(e);
      }
    },
    [client, login, onSuccessRedirectTo, setError, validateFields]
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

  const code = getCodeFromError(error);

  return (
    <Form layout="vertical" onSubmit={handleSubmit}>
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

      {error ? (
        <Form.Item>
          <Alert
            type="error"
            message={`Login failed`}
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
        <Button
          type="primary"
          htmlType="submit"
          disabled={hasErrors(getFieldsError())}
        >
          Log in
        </Button>
      </Form.Item>
      <Form.Item>
        <p>
          <Link href="/forgot">
            <a>Forgot password?</a>
          </Link>
        </p>
      </Form.Item>
    </Form>
  );
}

const WrappedLoginForm = Form.create<LoginFormProps>({
  name: "login",
  onValuesChange(props) {
    props.setError(null);
  },
})(LoginForm);

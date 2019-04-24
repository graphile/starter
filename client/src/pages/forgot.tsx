import React, {
  useRef,
  useEffect,
  FormEvent,
  useCallback,
  useState,
  useMemo,
} from "react";
import { promisify } from "util";
import SharedLayout from "../components/SharedLayout";
import Link from "next/link";
import { Form, Icon, Input, Button, Alert } from "antd";
import { FormComponentProps } from "antd/lib/form/Form";
import { compose, withApollo, WithApolloClient } from "react-apollo";
import {
  withForgotPasswordMutation,
  ForgotPasswordMutationMutationFn,
} from "../graphql";
import { ApolloError } from "apollo-client";
import { getCodeFromError, extractError } from "../errors";

export default function ForgotPassword() {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  return (
    <SharedLayout title="Forgot Password">
      <WrappedForgotPasswordForm error={error} setError={setError} />
    </SharedLayout>
  );
}

interface FormValues {
  email: string;
}

interface ForgotPasswordFormProps extends FormComponentProps<FormValues> {
  forgotPassword: ForgotPasswordMutationMutationFn;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function ForgotPasswordForm({
  form,
  forgotPassword,
  error,
  setError,
}: WithApolloClient<ForgotPasswordFormProps>) {
  const [success, setSuccess] = useState(false);

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
        await forgotPassword({
          variables: {
            email: values.email,
          },
        });
        // Success: refetch
        setSuccess(true);
      } catch (e) {
        setError(e);
      }
    },
    [forgotPassword, setError, validateFields]
  );

  const focusElement = useRef<Input>(null);
  useEffect(
    () => void (focusElement.current && focusElement.current!.focus()),
    [focusElement]
  );

  const { getFieldDecorator, getFieldError, isFieldTouched } = form;

  // Only show error after a field is touched.
  const emailError = isFieldTouched("email") && getFieldError("email");

  const code = getCodeFromError(error);

  if (success) {
    return (
      <Alert
        type="success"
        message="You've got mail"
        description="We've sent you an email reset link; click the link and follow the instructions"
      />
    );
  }

  return (
    <Form layout="vertical" onSubmit={handleSubmit}>
      <Form.Item
        validateStatus={emailError ? "error" : ""}
        help={emailError || ""}
      >
        {getFieldDecorator("email", {
          rules: [
            {
              type: "email",
              message: "The input is not valid E-mail",
            },
            { required: true, message: "Please input your email" },
          ],
        })(
          <Input
            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="Email"
            ref={focusElement}
          />
        )}
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
  );
}

const WrappedForgotPasswordForm = compose(
  Form.create<ForgotPasswordFormProps>({
    name: "forgotPassword",
    onValuesChange(props) {
      props.setError(null);
    },
  }),
  withForgotPasswordMutation({ name: "forgotPassword" }),
  withApollo
)(ForgotPasswordForm);

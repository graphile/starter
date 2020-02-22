import { SharedLayout } from "@app/components";
import { useForgotPasswordMutation, useSharedQuery } from "@app/graphql";
import { extractError, getCodeFromError } from "@app/lib";
import { Alert, Button, Form, Icon, Input } from "antd";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { ApolloError } from "apollo-client";
import { NextPage } from "next";
import Link from "next/link";
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { promisify } from "util";

const ForgotPassword: NextPage = () => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const query = useSharedQuery();
  return (
    <SharedLayout title="Forgot Password" query={query}>
      <WrappedForgotPasswordForm error={error} setError={setError} />
    </SharedLayout>
  );
};

export default ForgotPassword;

interface FormValues {
  email: string;
}

interface ForgotPasswordFormProps extends FormComponentProps<FormValues> {
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function ForgotPasswordForm({
  form,
  error,
  setError,
}: ForgotPasswordFormProps) {
  const [forgotPassword] = useForgotPasswordMutation();
  const [successfulEmail, setSuccessfulEmail] = useState<string | null>(null);

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

const WrappedForgotPasswordForm = Form.create<ForgotPasswordFormProps>({
  name: "forgotPassword",
  onValuesChange(props) {
    props.setError(null);
  },
})(ForgotPasswordForm);

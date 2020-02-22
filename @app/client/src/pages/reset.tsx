import React, { useCallback, useState, useMemo, FocusEvent } from "react";
import get from "lodash/get";
import { Alert, Form, Button, Input } from "antd";
import { SharedLayout, Row, Col } from "@app/components";
import { NextPage } from "next";
import { useResetPasswordMutation, useSharedQuery } from "@app/graphql";
import { setPasswordInfo } from "@app/lib";
import { formItemLayout, tailFormItemLayout } from "../forms";
import { PasswordStrength } from "@app/components";
import { ApolloError } from "apollo-client";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { promisify } from "util";

interface IProps {
  userId: string | null;
  token: string | null;
}

enum State {
  PENDING = "PENDING",
  SUBMITTING = "SUBMITTING",
  SUCCESS = "SUCCESS",
}

const ResetPage: NextPage<IProps> = ({ userId, token }) => {
  const [error, setError] = useState<Error | null>(null);
  const [strength, setStrength] = useState<number>(0);
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);
  const [state, setState] = useState<State>(State.PENDING);
  const query = useSharedQuery();
  return (
    <SharedLayout title="Reset Password" query={query}>
      <Row>
        <Col>
          <WrappedResetForm
            passwordStrength={strength}
            setPasswordStrength={setStrength}
            passwordSuggestions={passwordSuggestions}
            setPasswordSuggestions={setPasswordSuggestions}
            error={error}
            setError={setError}
            userId={userId}
            token={token}
            state={state}
            setState={setState}
          />
        </Col>
      </Row>
    </SharedLayout>
  );
};

interface FormValues {
  name: string;
  username: string;
  email: string;
  password: string;
  confirm: string;
}

interface ResetFormProps extends FormComponentProps<FormValues> {
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
  passwordStrength: number;
  setPasswordStrength: (strength: number) => void;
  passwordSuggestions: string[];
  setPasswordSuggestions: (suggestions: string[]) => void;
  state: State;
  setState: (newState: State) => void;

  userId: string | null;
  token: string | null;
}

function ResetForm({
  form,
  error,
  setError,
  passwordStrength,
  passwordSuggestions,
  userId: rawUserId,
  token: rawToken,
  state,
  setState,
}: ResetFormProps) {
  const { getFieldDecorator } = form;

  const [[userId, token], setIdAndToken] = useState<[string, string]>([
    rawUserId || "",
    rawToken || "",
  ]);

  const [resetPassword] = useResetPasswordMutation();

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const validateFieldsAndScroll: () => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFieldsAndScroll(...args)),
    [form]
  );

  const [passwordIsFocussed, setPasswordIsFocussed] = useState(false);
  const setPasswordFocussed = useCallback(() => {
    setPasswordIsFocussed(true);
  }, [setPasswordIsFocussed]);
  const setPasswordNotFocussed = useCallback(() => {
    setPasswordIsFocussed(false);
  }, [setPasswordIsFocussed]);

  const [confirmDirty, setConfirmDirty] = useState(false);

  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFields(...args)),
    [form]
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
        callback(
          "Make sure your passphrase is the same in both passphrase boxes."
        );
      } else {
        callback();
      }
    },
    [form]
  );

  const handleConfirmBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setConfirmDirty(confirmDirty || !!value);
    },
    [confirmDirty]
  );

  const handleSubmit = useCallback(
    e => {
      e.preventDefault();
      setState(State.SUBMITTING);
      setError(null);
      (async () => {
        try {
          const values = await validateFieldsAndScroll();
          const result = await resetPassword({
            variables: {
              userId,
              token,
              password: values.password,
            },
          });
          if (get(result, "data.resetPassword.success")) {
            setState(State.SUCCESS);
          } else {
            setState(State.PENDING);
            setError(new Error("Incorrect token, please check and try again"));
          }
        } catch (e) {
          if (e.message) {
            setError(e);
          } else {
            setError(new Error("Please check the errors above and try again"));
            console.dir(e);
          }
          setState(State.PENDING);
        }
      })();
    },
    [resetPassword, setError, setState, token, userId, validateFieldsAndScroll]
  );

  return (
    <div>
      {state === "SUBMITTING" ? (
        <Alert
          type="info"
          message="Submitting..."
          description="This might take a few moments..."
        />
      ) : state === "SUCCESS" ? (
        <Alert
          type="success"
          message="Password Reset"
          description="Your password was reset; you can go and log in now"
        />
      ) : null}

      <Form
        {...formItemLayout}
        onSubmit={handleSubmit}
        style={{ display: state === State.PENDING ? "" : "none" }}
      >
        <Form.Item label="Enter your reset token:">
          <Input
            type="text"
            value={token}
            onChange={e => setIdAndToken([userId, e.target.value])}
          />
        </Form.Item>
        <Form.Item label="Choose a new passphrase:">
          {getFieldDecorator("password", {
            rules: [
              {
                required: true,
                message: "Please input your passphrase.",
              },
              {
                validator: validateToNextPassword,
              },
            ],
          })(
            <Input
              type="password"
              autoComplete="new-password"
              data-cy="registerpage-input-password"
              onFocus={setPasswordFocussed}
              onBlur={setPasswordNotFocussed}
            />
          )}
          <PasswordStrength
            passwordStrength={passwordStrength}
            suggestions={passwordSuggestions}
            isDirty={form.isFieldTouched("password")}
            isFocussed={passwordIsFocussed}
          />
        </Form.Item>
        <Form.Item label="Confirm passphrase">
          {getFieldDecorator("confirm", {
            rules: [
              {
                required: true,
                message: "Please confirm your passphrase.",
              },
              {
                validator: compareToFirstPassword,
              },
            ],
          })(
            <Input
              type="password"
              autoComplete="new-password"
              onBlur={handleConfirmBlur}
              data-cy="registerpage-input-password2"
            />
          )}
        </Form.Item>
        {error ? (
          <Form.Item>
            <Alert
              type="error"
              closable
              onClose={clearError}
              message={error.message || String(error)}
            />
          </Form.Item>
        ) : null}
        <Form.Item {...tailFormItemLayout}>
          <Button htmlType="submit" data-cy="resetpage-submit-button">
            Reset passphrase
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

const WrappedResetForm = Form.create<ResetFormProps>({
  name: "resetform",
  onValuesChange(props) {
    props.setError(null);
  },
  onFieldsChange(props, changedValues) {
    setPasswordInfo(props, changedValues);
  },
})(ResetForm);

ResetPage.getInitialProps = async ({ query: { user_id, token } = {} }) => ({
  userId: typeof user_id === "string" ? user_id : null,
  token: typeof token === "string" ? token : null,
});

export default ResetPage;

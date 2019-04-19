import React, {
  useState,
  useCallback,
  useMemo,
  FocusEvent,
  useEffect,
} from "react";
import SharedLayout, { Row, Col } from "../components/SharedLayout";
import { compose, withApollo, WithApolloClient } from "react-apollo";
import { withRegisterMutation, RegisterMutationMutationFn } from "../graphql";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { Form, Input, Tooltip, Icon, Button } from "antd";
import { SyntheticEvent } from "react";
import { promisify } from "util";
import Router from "next/router";

interface RegisterProps {}

/**
 * The registration page just renders the standard layout and embeds the
 * registration form.
 */
export default function Register(_props: RegisterProps) {
  return (
    <SharedLayout title="Register">
      <WrappedRegistrationForm onSuccessRedirectTo="/" />
    </SharedLayout>
  );
}

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
  register: RegisterMutationMutationFn;
  onSuccessRedirectTo: string;
}

/**
 * This component is responsible for rendering the registration form, and
 * handling all the related events (e.g. form submit).
 *
 * On successful registration it will redirect to the path specified in
 * 'onSuccessRedirectTo'.
 */
function RegistrationForm({
  register,
  form,
  client,
  onSuccessRedirectTo,
}: WithApolloClient<RegistrationFormProps>) {
  const [confirmDirty, setConfirmDirty] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
        client.resetStore();
        Router.push(onSuccessRedirectTo);
      } catch (e) {
        setError(e);
      }
    },
    [validateFieldsAndScroll, register, client, onSuccessRedirectTo]
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
        callback();
      } catch (e) {
        callback(e);
      }
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

  const { getFieldDecorator } = form;

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };
  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  };

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item
        label={
          <span>
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
              message: "Please input your name",
              whitespace: true,
            },
          ],
        })(<Input />)}
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
              message: "Please input your username",
              whitespace: true,
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item label="E-mail">
        {getFieldDecorator("email", {
          rules: [
            {
              type: "email",
              message: "The input is not valid E-mail",
            },
            {
              required: true,
              message: "Please input your E-mail",
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item label="Password">
        {getFieldDecorator("password", {
          rules: [
            {
              required: true,
              message: "Please input your password",
            },
            {
              validator: validateToNextPassword,
            },
          ],
        })(<Input type="password" />)}
      </Form.Item>
      <Form.Item label="Confirm Password">
        {getFieldDecorator("confirm", {
          rules: [
            {
              required: true,
              message: "Please confirm your password",
            },
            {
              validator: compareToFirstPassword,
            },
          ],
        })(<Input type="password" onBlur={handleConfirmBlur} />)}
      </Form.Item>
      {error ? <p>{error.message}</p> : null}
      <Form.Item {...tailFormItemLayout}>
        <Button htmlType="submit">Register</Button>
      </Form.Item>
    </Form>
  );
}

const WrappedRegistrationForm = compose(
  Form.create<FormValues>({ name: "registerform" }),
  withRegisterMutation({ name: "register" }),
  withApollo
)(RegistrationForm);

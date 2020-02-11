import React, {
  FC,
  useState,
  useCallback,
  SyntheticEvent,
  useMemo,
} from "react";
import { NextPage } from "next";
import SharedLayout from "../../layout/SharedLayout";
import { Row, Col, Form, Input, Alert, Button } from "antd";
import { H3, Redirect } from "@app/components";
import {
  useCreateOrganizationMutation,
  CreateOrganizationMutation,
  CreatedOrganizationFragment,
} from "@app/graphql";
import { formItemLayout, tailFormItemLayout } from "../../forms";
import { FormComponentProps } from "antd/lib/form";
import { ApolloError } from "apollo-client";
import { extractError, getCodeFromError } from "../../errors";
import slugify from "slugify";
import { ValidateFieldsOptions } from "antd/lib/form/Form";
import { promisify } from "util";

const CreateOrganizationPage: NextPage = () => {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  return (
    <SharedLayout title="Create Organization">
      <Row>
        <Col>
          <h1>Create Organization</h1>
          <WrappedCreateOrganizationForm
            error={formError}
            setError={setFormError}
          />
        </Col>
      </Row>
    </SharedLayout>
  );
};

interface FormValues {
  name: string;
}

interface CreateOrganizationFormProps extends FormComponentProps<FormValues> {
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

const CreateOrganizationForm: FC<CreateOrganizationFormProps> = props => {
  const { form, error, setError } = props;
  const { getFieldDecorator, getFieldValue } = form;
  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFields(...args)),
    [form]
  );
  const slug = slugify(getFieldValue("name") || "", {
    lower: true,
  });
  const code = getCodeFromError(error);
  const [
    organization,
    setOrganization,
  ] = useState<null | CreatedOrganizationFragment>(null);
  const [createOrganization] = useCreateOrganizationMutation();
  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      setError(null);
      try {
        const values = await validateFields();
        const { name } = values;
        const slug = slugify(name || "", {
          lower: true,
        });
        const { data } = await createOrganization({
          variables: {
            name,
            slug,
          },
        });
        setError(null);
        setOrganization(data?.createOrganization?.organization || null);
      } catch (e) {
        const errcode = getCodeFromError(e);
        if (errcode === "23505") {
          form.setFields({
            username: {
              value: form.getFieldValue("username"),
              errors: [
                new Error(
                  "This username is already in use, please pick a different name"
                ),
              ],
            },
          });
        } else {
          setError(e);
        }
      }
    },
    [createOrganization, form, setError, validateFields]
  );

  if (organization) {
    return <Redirect href={`/o/${organization.slug}`} />;
  }

  return (
    <div>
      <H3>Edit Profile</H3>
      <Form {...formItemLayout} onSubmit={handleSubmit}>
        <Form.Item label="Name">
          {getFieldDecorator("name", {
            initialValue: "",
            rules: [
              {
                required: true,
                message: "Please choose a name for the organization",
              },
            ],
          })(
            <div>
              <Input />
              <p>
                Your organization URL will be{" "}
                {`${process.env.ROOT_URL}/o/${slug}`}
              </p>
            </div>
          )}
        </Form.Item>
        {error ? (
          <Form.Item>
            <Alert
              type="error"
              message={`Creating organization failed`}
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
          <Button htmlType="submit">Create Organization</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const WrappedCreateOrganizationForm = Form.create<CreateOrganizationFormProps>({
  name: "createOrganizationForm",
  onValuesChange(props) {
    props.setError(null);
  },
})(CreateOrganizationForm);

export default CreateOrganizationPage;

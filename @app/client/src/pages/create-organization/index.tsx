import React, {
  FC,
  useState,
  useCallback,
  SyntheticEvent,
  useMemo,
  useEffect,
} from "react";
import { NextPage } from "next";
import { SharedLayout } from "@app/components";
import { Row, Col, Form, Input, Alert, Button, Spin } from "antd";
import { H3, Redirect } from "@app/components";
import {
  useCreateOrganizationMutation,
  CreatedOrganizationFragment,
  useOrganizationBySlugLazyQuery,
  useSharedQuery,
} from "@app/graphql";
import { formItemLayout, tailFormItemLayout } from "../../forms";
import { FormComponentProps } from "antd/lib/form";
import { ApolloError } from "apollo-client";
import { extractError, getCodeFromError } from "../../errors";
import slugify from "slugify";
import { ValidateFieldsOptions } from "antd/lib/form/Form";
import { promisify } from "util";
import { debounce } from "lodash";
import Text from "antd/lib/typography/Text";

const CreateOrganizationPage: NextPage = () => {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSharedQuery();
  return (
    <SharedLayout title="Create Organization" query={query}>
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
  const [
    lookupOrganizationBySlug,
    { data: existingOrganizationData, loading: slugLoading, error: slugError },
  ] = useOrganizationBySlugLazyQuery();

  const [slugCheckIsValid, setSlugCheckIsValid] = useState(false);
  const checkSlug = useMemo(
    () =>
      debounce(async (slug: string) => {
        try {
          if (slug) {
            await lookupOrganizationBySlug({
              variables: {
                slug,
              },
            });
          }
        } catch (e) {
          /* NOOP */
        } finally {
          setSlugCheckIsValid(true);
        }
      }, 500),
    [lookupOrganizationBySlug]
  );

  useEffect(() => {
    setSlugCheckIsValid(false);
    checkSlug(slug);
  }, [checkSlug, slug]);

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
        if (errcode === "NUNIQ") {
          form.setFields({
            name: {
              value: form.getFieldValue("name"),
              errors: [
                new Error(
                  "This organization name is already in use, please pick a different name"
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
              {!slug ? null : !slugCheckIsValid || slugLoading ? (
                <p>
                  <Spin /> Checking organization name
                </p>
              ) : existingOrganizationData?.organizationBySlug ? (
                <Text type="danger">Organization name is already in use</Text>
              ) : slugError ? (
                <Text type="warning">
                  Error occurred checking for existing organization with this
                  name (error code: ERR_{getCodeFromError(slugError)})
                </Text>
              ) : null}
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
                  {code === "NUNIQ" ? (
                    <span>
                      That organization name is already in use, please choose a
                      different organization name.
                    </span>
                  ) : (
                    extractError(error).message
                  )}
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

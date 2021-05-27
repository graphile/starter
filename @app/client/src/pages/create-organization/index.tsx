import { ApolloError } from "@apollo/client";
import { AuthRestrict, Redirect, SharedLayout } from "@app/components";
import {
  CreatedOrganizationFragment,
  useCreateOrganizationMutation,
  useOrganizationBySlugLazyQuery,
  useSharedQuery,
} from "@app/graphql";
import {
  extractError,
  formItemLayout,
  getCodeFromError,
  tailFormItemLayout,
} from "@app/lib";
import { Alert, Button, Col, Form, Input, PageHeader, Row, Spin } from "antd";
import { useForm } from "antd/lib/form/Form";
import Text from "antd/lib/typography/Text";
import { debounce } from "lodash";
import { NextPage } from "next";
import { Store } from "rc-field-form/lib/interface";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import slugify from "slugify";

const CreateOrganizationPage: NextPage = () => {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSharedQuery();
  const [form] = useForm();
  const [slug, setSlug] = useState("");
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

  const code = getCodeFromError(formError);
  const [organization, setOrganization] =
    useState<null | CreatedOrganizationFragment>(null);
  const [createOrganization] = useCreateOrganizationMutation();
  const handleSubmit = useCallback(
    async (values: Store) => {
      setFormError(null);
      try {
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
        setFormError(null);
        setOrganization(data?.createOrganization?.organization || null);
      } catch (e) {
        setFormError(e);
      }
    },
    [createOrganization]
  );
  const handleValuesChange = useCallback((values: Store) => {
    if ("name" in values) {
      setSlug(
        slugify(values.name, {
          lower: true,
        })
      );
    }
  }, []);

  if (organization) {
    return (
      <Redirect layout href={`/o/[slug]`} as={`/o/${organization.slug}`} />
    );
  }

  return (
    <SharedLayout title="" query={query} forbidWhen={AuthRestrict.LOGGED_OUT}>
      <Row>
        <Col flex={1}>
          <PageHeader title="Create Organization" />
          <div>
            <Form
              {...formItemLayout}
              form={form}
              onValuesChange={handleValuesChange}
              onFinish={handleSubmit}
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please choose a name for the organization",
                  },
                ]}
              >
                <div>
                  <Input data-cy="createorganization-input-name" />
                  <p>
                    Your organization URL will be{" "}
                    <span data-cy="createorganization-slug-value">{`${process.env.ROOT_URL}/o/${slug}`}</span>
                  </p>
                  {!slug ? null : !slugCheckIsValid || slugLoading ? (
                    <div>
                      <Spin /> Checking organization name
                    </div>
                  ) : existingOrganizationData?.organizationBySlug ? (
                    <Text
                      type="danger"
                      data-cy="createorganization-hint-nameinuse"
                    >
                      Organization name is already in use
                    </Text>
                  ) : slugError ? (
                    <Text type="warning">
                      Error occurred checking for existing organization with
                      this name (error code: ERR_{getCodeFromError(slugError)})
                    </Text>
                  ) : null}
                </div>
              </Form.Item>
              {formError ? (
                <Form.Item {...tailFormItemLayout}>
                  <Alert
                    type="error"
                    message={`Creating organization failed`}
                    description={
                      <span>
                        {code === "NUNIQ" ? (
                          <span data-cy="createorganization-alert-nuniq">
                            That organization name is already in use, please
                            choose a different organization name.
                          </span>
                        ) : (
                          extractError(formError).message
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
                <Button
                  htmlType="submit"
                  data-cy="createorganization-button-create"
                >
                  Create
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </SharedLayout>
  );
};

export default CreateOrganizationPage;

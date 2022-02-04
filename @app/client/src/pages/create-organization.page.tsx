import { ApolloError } from "@apollo/client";
import {
  AuthRestrict,
  PageHeader,
  Redirect,
  SharedLayout,
  Spin,
} from "@app/client/src/components";
import { usePageContext } from "@app/client/src/renderer/usePageContext";
import {
  CreatedOrganizationFragment,
  useCreateOrganizationMutation,
  useOrganizationBySlugLazyQuery,
  useSharedQuery,
} from "@app/graphql";

import { extractError, getCodeFromError } from "@app/lib";
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue, useForm } from "@mantine/hooks";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import slugify from "slugify";

export { Page };

const Page: React.FC = () => {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSharedQuery();
  const form = useForm({
    initialValues: {
      name: "",
    },
  });
  const pageContext = usePageContext();

  const [slug, setSlug] = useState("");
  const [debouncedSlug] = useDebouncedValue(slug, 500);
  const [
    lookupOrganizationBySlug,
    { data: existingOrganizationData, loading: slugLoading, error: slugError },
  ] = useOrganizationBySlugLazyQuery();

  const [slugCheckIsValid, setSlugCheckIsValid] = useState(false);
  const checkSlug = useMemo(
    () => async (slug: string) => {
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
    },
    [lookupOrganizationBySlug]
  );

  useEffect(() => {
    setSlugCheckIsValid(false);
    checkSlug(debouncedSlug);
  }, [checkSlug, debouncedSlug]);

  useEffect(() => {
    setSlug(slugify(form.values.name, { lower: true }));
  }, [form.values.name]);

  const code = getCodeFromError(formError);
  const [organization, setOrganization] =
    useState<null | CreatedOrganizationFragment>(null);
  const [createOrganization] = useCreateOrganizationMutation();
  const handleSubmit = useCallback(
    async (values: typeof form.values) => {
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

  if (organization) {
    return <Redirect layout href={`/o/${organization.slug}`} />;
  }

  return (
    <SharedLayout title="" query={query} forbidWhen={AuthRestrict.LOGGED_OUT}>
      <Grid>
        <Grid.Col span={12}>
          <PageHeader title="Create Organization" />
          <div>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                <Group sx={{ gap: 12 }}>
                  <Text align={"right"} sx={{ width: 150 }}>
                    Name
                  </Text>
                  <TextInput
                    required
                    sx={{ flexGrow: 1 }}
                    data-cy="createorganization-input-name"
                    {...form.getInputProps("name")}
                  />
                </Group>
                <Group sx={{ gap: 12 }}>
                  <Text align={"right"} sx={{ width: 150 }}>
                    &nbsp;
                  </Text>
                  <Text sx={{ flexGrow: 1 }}>
                    <div>
                      Your organization URL will be{" "}
                      <span data-cy="createorganization-slug-value">{`${pageContext.ROOT_URL}/o/${slug}`}</span>
                      {!slug ? null : !slugCheckIsValid || slugLoading ? (
                        <div>
                          <Spin /> Checking organization name
                        </div>
                      ) : existingOrganizationData?.organizationBySlug ? (
                        <Text
                          color={"red"}
                          data-cy="createorganization-hint-nameinuse"
                        >
                          Organization name is already in use
                        </Text>
                      ) : slugError ? (
                        <Text color={"orange"}>
                          Error occurred checking for existing organization with
                          this name (error code: ERR_
                          {getCodeFromError(slugError)})
                        </Text>
                      ) : null}
                    </div>
                  </Text>
                </Group>

                {formError ? (
                  <Group sx={{ gap: 12 }}>
                    <Text align={"right"} sx={{ width: 150 }}>
                      &nbsp;
                    </Text>
                    <Alert color={"red"} title={`Creating organization failed`}>
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
                    </Alert>
                  </Group>
                ) : null}
                <Group sx={{ gap: 12 }}>
                  <Text align={"right"} sx={{ width: 150 }}>
                    &nbsp;
                  </Text>
                  <Button
                    type="submit"
                    data-cy="createorganization-button-create"
                  >
                    Create
                  </Button>
                </Group>
              </Box>
            </form>
          </div>
        </Grid.Col>
      </Grid>
    </SharedLayout>
  );
};

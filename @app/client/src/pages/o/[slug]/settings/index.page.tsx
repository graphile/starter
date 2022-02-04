import {
  OrganizationSettingsLayout,
  PageHeader,
  Redirect,
  useOrganizationSlug,
} from "@app/client/src/components";
import {
  OrganizationPage_OrganizationFragment,
  useOrganizationPageQuery,
  useUpdateOrganizationMutation,
} from "@app/graphql";
import { extractError } from "@app/lib";
import { Alert, Box, Button, Group, Text, TextInput } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import React, { useCallback, useState } from "react";
import { useForm } from "@mantine/hooks";
import { navigate } from "vite-plugin-ssr/client/router";

export { Page };

const Page: React.FC = () => {
  const slug = useOrganizationSlug();
  const query = useOrganizationPageQuery({ variables: { slug } });
  const organization = query?.data?.organizationBySlug || null;

  return (
    <OrganizationSettingsLayout
      title={`${organization?.name ?? slug}`}
      titleHref={`/o/${slug}/settings`}
      href={`/o/[slug]/settings`}
      query={query}
      organization={organization}
    >
      {organization && <OrganizationPageInner organization={organization} />}
    </OrganizationSettingsLayout>
  );
};

interface OrganizationPageInnerProps {
  organization: OrganizationPage_OrganizationFragment;
}

const OrganizationPageInner: React.FC<OrganizationPageInnerProps> = (props) => {
  const { organization } = props;
  const { name, slug } = organization;
  const form = useForm({
    initialValues: {
      slug,
      name,
    },
  });
  const [updateOrganization] = useUpdateOrganizationMutation();
  const [error, setError] = useState<Error | null>(null);
  const notifications = useNotifications();

  const handleSubmit = useCallback(
    async (values: typeof form.values) => {
      try {
        setError(null);
        const { data } = await updateOrganization({
          variables: {
            input: {
              id: organization.id,
              patch: { slug: values.slug, name: values.name },
            },
          },
        });
        notifications.showNotification({
          message: "Organization updated",
        });
        const newSlug = data?.updateOrganization?.organization?.slug;
        if (newSlug && newSlug !== organization.slug) {
          // Don't await navigate()
          navigate(`/o/${newSlug}/settings`);
        }
      } catch (e) {
        setError(e);
      }
    },
    [organization.id, organization.slug, updateOrganization]
  );

  if (
    !organization.currentUserIsBillingContact &&
    !organization.currentUserIsOwner
  ) {
    return <Redirect href={`/o/${organization.slug}`} />;
  }

  return (
    <div>
      <PageHeader title="Profile" />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Group sx={{ gap: 12 }}>
            <Text align={"right"} sx={{ width: 150 }}>
              Organization name
            </Text>
            <TextInput
              required
              sx={{ flexGrow: 1 }}
              {...form.getInputProps("name")}
            />
          </Group>
          <Group sx={{ gap: 12 }}>
            <Text align={"right"} sx={{ width: 150 }}>
              Slug
            </Text>
            <TextInput
              required
              sx={{ flexGrow: 1 }}
              {...form.getInputProps("slug")}
            />
          </Group>

          {error ? (
            <Group sx={{ gap: 12 }}>
              <Text align={"right"} sx={{ width: 150 }}>
                &nbsp;
              </Text>
              <Alert color={"red"} title={`Updating organization`}>
                <span>{extractError(error).message}</span>
              </Alert>
            </Group>
          ) : null}
          <Group sx={{ gap: 12 }}>
            <Text align={"right"} sx={{ width: 150 }}>
              &nbsp;
            </Text>
            <Button type="submit">Update organization</Button>
          </Group>
        </Box>
      </form>
    </div>
  );
};

import {
  ErrorAlert,
  OrganizationSettingsLayout,
  PageHeader,
  useOrganizationLoading,
  useOrganizationSlug,
} from "@app/client/src/components";
import {
  OrganizationPage_OrganizationFragment,
  SharedLayout_UserFragment,
  useDeleteOrganizationMutation,
  useOrganizationPageQuery,
} from "@app/graphql";
import { Alert, Button, Text } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import React, { useCallback, useState } from "react";
import { navigate } from "vite-plugin-ssr/client/router";
import { ApolloError } from "@apollo/client";
import { Popconfirm } from "@app/client/src/components/Popconfirm";

export { Page };

const Page: React.FC = () => {
  const slug = useOrganizationSlug();
  const query = useOrganizationPageQuery({ variables: { slug } });
  const organization = query?.data?.organizationBySlug || null;
  const organizationLoadingElement = useOrganizationLoading(query);

  return (
    <OrganizationSettingsLayout
      title={`${organization?.name ?? slug}`}
      titleHref={`/o/${slug}`}
      href={`/o/[slug]`}
      query={query}
      organization={organization}
    >
      {({ currentUser }) =>
        organizationLoadingElement || (
          <OrganizationSettingsPageInner
            organization={organization!}
            currentUser={currentUser}
          />
        )
      }
    </OrganizationSettingsLayout>
  );
};

interface OrganizationSettingsPageInnerProps {
  currentUser?: SharedLayout_UserFragment | null;
  organization: OrganizationPage_OrganizationFragment;
}

const OrganizationSettingsPageInner: React.FC<OrganizationSettingsPageInnerProps> =
  (props) => {
    const { organization } = props;
    const notifications = useNotifications();

    const [deleteOrganization] = useDeleteOrganizationMutation();
    const [error, setError] = useState<ApolloError | null>(null);
    const [popOpen, setPopOpen] = useState(false);
    const handleDelete = useCallback(async () => {
      try {
        await deleteOrganization({
          variables: {
            organizationId: organization.id,
          },
          // TODO mc-2022-02-03 This doesn't seem to be doing the job
          // or there's a caching issue
          refetchQueries: ["Shared"],
          awaitRefetchQueries: true,
        });
        notifications.showNotification({
          message: `Organization '${organization.name}' successfully deleted`,
        });
        // Don't await navigate()
        await navigate("/");
      } catch (e) {
        setError(e);
        return;
      }
    }, [deleteOrganization, organization.id, organization.name]);

    return (
      <div>
        <PageHeader title="Delete Organization?" />
        {organization.currentUserIsOwner ? (
          <Alert color={"red"} title={`Really delete '${organization.name}'`}>
            <div>
              <Text>This action cannot be undone, be very careful.</Text>
              <Popconfirm
                opened={popOpen}
                okText={"Yes"}
                cancelText={"No"}
                title={`Are you sure you want to delete {organization.name}?`}
                onClose={() => setPopOpen(false)}
                onConfirm={handleDelete}
                target={
                  <Button color={"white"} onClick={() => setPopOpen(!popOpen)}>
                    Delete this organization
                  </Button>
                }
              />
            </div>
          </Alert>
        ) : (
          <Alert color={"orange"} title="You are not permitted to do this">
            <Text>
              Only the owner may delete the organization. If you cannot reach
              the owner, please get in touch with support.
            </Text>
          </Alert>
        )}
        {error ? <ErrorAlert error={error} /> : null}
      </div>
    );
  };

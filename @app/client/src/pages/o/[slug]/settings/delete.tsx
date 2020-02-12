import React, { FC, useCallback, useState, ChangeEvent } from "react";
import { NextPage } from "next";
import {
  OrganizationPageOrganizationFragment,
  useOrganizationMembersQuery,
  OrganizationMembers_MembershipFragment,
  SharedLayout_UserFragment,
  useRemoveFromOrganizationMutation,
  useInviteToOrganizationMutation,
  useDeleteOrganizationMutation,
} from "@app/graphql";
import SharedLayout from "../../../../layout/SharedLayout";
import { H3, Redirect, P, ErrorAlert } from "@app/components";
import useOrganization from "../../../../lib/useOrganization";
import OrganizationSettingsLayout from "../../../../layout/OrganizationSettingsLayout";
import { List, Popconfirm, message, Alert, Button } from "antd";
import Text from "antd/lib/typography/Text";
import { Z_STREAM_ERROR } from "zlib";
import { ApolloError } from "apollo-client";
import { useRouter } from "next/router";

const OrganizationSettingsPage: NextPage = () => {
  const { organization, fallbackChild, slug } = useOrganization();
  return (
    <SharedLayout title={organization?.name ?? slug} noPad>
      {({ currentUser }) =>
        fallbackChild || (
          <OrganizationSettingsPageInner
            organization={organization!}
            currentUser={currentUser}
          />
        )
      }
    </SharedLayout>
  );
};

interface OrganizationSettingsPageInnerProps {
  currentUser?: SharedLayout_UserFragment | null;
  organization: OrganizationPageOrganizationFragment;
}

// This needs to match the `first:` used in OrganizationMembers.graphql
const RESULTS_PER_PAGE = 10;

const OrganizationSettingsPageInner: FC<OrganizationSettingsPageInnerProps> = props => {
  const { organization } = props;
  const router = useRouter();
  const [deleteOrganization] = useDeleteOrganizationMutation();
  const [error, setError] = useState<ApolloError | null>(null);
  const handleDelete = useCallback(async () => {
    try {
      await deleteOrganization({
        variables: {
          organizationId: organization.id,
        },
        refetchQueries: ["SharedLayout"],
      });
      message.info(`Organization '${organization.name}' successfully deleted`);
      router.push("/");
    } catch (e) {
      setError(e);
      return;
    }
  }, [deleteOrganization, organization.id, organization.name, router]);
  return (
    <OrganizationSettingsLayout
      organization={organization}
      href={`/o/${organization.slug}/settings/members`}
    >
      <div>
        <H3>Delete {organization.name}?</H3>
        {organization.currentUserIsOwner ? (
          <Alert
            type="error"
            message={`Really delete '${organization.name}'`}
            description={
              <div>
                <P>This action cannot be undone, be very careful.</P>
                <Popconfirm
                  title={`Are you sure you want to delete ${organization.name}?`}
                  onConfirm={handleDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button>Delete this organization</Button>
                </Popconfirm>
              </div>
            }
          />
        ) : (
          <Alert
            type="warning"
            message="You are not permitted to do this"
            description="Only the owner may delete the organization. If you cannot reach the owner, please get in touch with support."
          />
        )}
        {error ? <ErrorAlert error={error} /> : null}
      </div>
    </OrganizationSettingsLayout>
  );
};
export default OrganizationSettingsPage;

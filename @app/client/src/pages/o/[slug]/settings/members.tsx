import React, { FC, useCallback, useState } from "react";
import { NextPage } from "next";
import {
  OrganizationPageOrganizationFragment,
  useOrganizationMembersQuery,
  OrganizationMembers_MembershipFragment,
} from "@app/graphql";
import SharedLayout from "../../../../layout/SharedLayout";
import { H3, Redirect } from "@app/components";
import useOrganization from "../../../../lib/useOrganization";
import OrganizationSettingsLayout from "../../../../layout/OrganizationSettingsLayout";
import { List } from "antd";
import Text from "antd/lib/typography/Text";

const OrganizationSettingsPage: NextPage = () => {
  const { organization, fallbackChild, slug } = useOrganization();
  return (
    <SharedLayout title={organization?.name ?? slug} noPad>
      {fallbackChild || (
        <OrganizationSettingsPageInner organization={organization!} />
      )}
    </SharedLayout>
  );
};

interface OrganizationSettingsPageInnerProps {
  organization: OrganizationPageOrganizationFragment;
}

// This needs to match the `first:` used in OrganizationMembers.graphql
const RESULTS_PER_PAGE = 10;

const OrganizationSettingsPageInner: FC<OrganizationSettingsPageInnerProps> = props => {
  const { organization } = props;
  const [page, setPage] = useState(1);
  const { data } = useOrganizationMembersQuery({
    variables: {
      slug: organization.slug,
      offset: (page - 1) * RESULTS_PER_PAGE,
    },
  });

  const handlePaginationChange = (
    page: number
    //pageSize?: number | undefined
  ) => {
    setPage(page);
  };

  const renderItem = useCallback(
    (node: OrganizationMembers_MembershipFragment) => {
      const roles = [
        node.isOwner ? "owner" : null,
        node.isBillingContact ? "billing contact" : null,
      ]
        .filter(Boolean)
        .join(" and ");
      return (
        <List.Item actions={[<span key="remove">Remove</span>]}>
          <List.Item.Meta
            //avatar={...}
            title={node.user?.name}
            description={
              <div>
                <Text>{node.user?.username}</Text>
                {roles ? (
                  <div>
                    <Text type="secondary">({roles})</Text>
                  </div>
                ) : null}
              </div>
            }
          />
        </List.Item>
      );
    },
    []
  );

  if (
    !organization.currentUserIsBillingContact &&
    !organization.currentUserIsOwner
  ) {
    return <Redirect href={`/o/${organization.slug}`} />;
  }

  return (
    <OrganizationSettingsLayout
      organization={organization}
      href={`/o/${organization.slug}/settings/members`}
    >
      <div>
        <H3>{organization.name} Members</H3>
        <p>Members</p>
        <List
          dataSource={
            data?.organizationBySlug?.organizationMemberships?.nodes ?? []
          }
          pagination={{
            current: page,
            pageSize: RESULTS_PER_PAGE,
            total:
              data?.organizationBySlug?.organizationMemberships?.totalCount,
            onChange: handlePaginationChange,
          }}
          renderItem={renderItem}
        />
      </div>
    </OrganizationSettingsLayout>
  );
};

export default OrganizationSettingsPage;

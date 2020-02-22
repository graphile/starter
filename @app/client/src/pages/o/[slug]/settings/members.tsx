import React, { FC, useCallback, useState, ChangeEvent } from "react";
import { NextPage } from "next";
import {
  useOrganizationMembersQuery,
  OrganizationMembers_OrganizationFragment,
  OrganizationMembers_MembershipFragment,
  SharedLayout_UserFragment,
  useRemoveFromOrganizationMutation,
  useInviteToOrganizationMutation,
  useTransferOrganizationOwnershipMutation,
  useTransferOrganizationBillingContactMutation,
} from "@app/graphql";
import SharedLayout from "../../../../layout/SharedLayout";
import { H3, Redirect } from "@app/components";
import {
  useOrganizationSlug,
  useOrganizationLoading,
} from "../../../../lib/useOrganization";
import OrganizationSettingsLayout from "../../../../layout/OrganizationSettingsLayout";
import { List, Popconfirm, message } from "antd";
import Text from "antd/lib/typography/Text";

const OrganizationSettingsPage: NextPage = () => {
  const slug = useOrganizationSlug();
  const [page, setPage] = useState(1);
  const query = useOrganizationMembersQuery({
    variables: {
      slug,
      offset: (page - 1) * RESULTS_PER_PAGE,
    },
  });
  const organizationLoadingElement = useOrganizationLoading(query);
  const organization = query?.data?.organizationBySlug;

  return (
    <SharedLayout title={organization?.name ?? slug} noPad query={query}>
      {({ currentUser }) =>
        organizationLoadingElement || (
          <OrganizationSettingsPageInner
            organization={organization!}
            currentUser={currentUser}
            page={page}
            setPage={setPage}
          />
        )
      }
    </SharedLayout>
  );
};

interface OrganizationSettingsPageInnerProps {
  currentUser?: SharedLayout_UserFragment | null;
  organization: OrganizationMembers_OrganizationFragment;
  page: number;
  setPage: (newPage: number) => void;
}

// This needs to match the `first:` used in OrganizationMembers.graphql
const RESULTS_PER_PAGE = 10;

const OrganizationSettingsPageInner: FC<OrganizationSettingsPageInnerProps> = props => {
  const { organization, currentUser, page, setPage } = props;

  const handlePaginationChange = (
    page: number
    //pageSize?: number | undefined
  ) => {
    setPage(page);
  };

  const renderItem = useCallback(
    (node: OrganizationMembers_MembershipFragment) => (
      <OrganizationMemberListItem
        node={node}
        organization={organization}
        currentUser={currentUser}
      />
    ),
    [currentUser, organization]
  );

  const [inviteToOrganization] = useInviteToOrganizationMutation();
  const [inviteText, setInviteText] = useState("");
  const [inviteInProgress, setInviteInProgress] = useState(false);
  const handleInviteChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInviteText(e.target.value);
  }, []);
  const handleInviteSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (inviteInProgress) {
        return;
      }
      setInviteInProgress(true);
      const isEmail = inviteText.includes("@");
      try {
        await inviteToOrganization({
          variables: {
            organizationId: organization.id,
            email: isEmail ? inviteText : null,
            username: isEmail ? null : inviteText,
          },
        });
        setInviteText("");
      } catch (e) {
        // TODO: handle this through the interface
        message.error("Could not invite to organization: " + e.message);
      } finally {
        setInviteInProgress(false);
      }
    },
    [inviteInProgress, inviteText, inviteToOrganization, organization.id]
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
        <p>Invite member</p>
        <form onSubmit={handleInviteSubmit}>
          <div>
            <input
              type="text"
              value={inviteText}
              onChange={handleInviteChange}
              placeholder="Enter username or email"
              disabled={inviteInProgress}
            />
          </div>
          <button disabled={inviteInProgress}>Invite</button>
        </form>
        <p>Members</p>
        <List
          dataSource={organization.organizationMemberships?.nodes ?? []}
          pagination={{
            current: page,
            pageSize: RESULTS_PER_PAGE,
            total: organization.organizationMemberships?.totalCount,
            onChange: handlePaginationChange,
          }}
          renderItem={renderItem}
        />
      </div>
    </OrganizationSettingsLayout>
  );
};

interface OrganizationMemberListItemProps {
  node: OrganizationMembers_MembershipFragment;
  organization: OrganizationMembers_OrganizationFragment;
  currentUser?: SharedLayout_UserFragment | null;
}

const OrganizationMemberListItem: FC<OrganizationMemberListItemProps> = props => {
  const { node, organization, currentUser } = props;

  const [removeMember] = useRemoveFromOrganizationMutation();
  const handleRemove = useCallback(async () => {
    try {
      await removeMember({
        variables: {
          organizationId: organization.id,
          userId: node.user?.id ?? 0,
        },
        refetchQueries: ["OrganizationMembers"],
      });
    } catch (e) {
      message.error("Error occurred when removing member: " + e.message);
    }
  }, [node.user, organization.id, removeMember]);

  const [transferOwnership] = useTransferOrganizationOwnershipMutation();
  const handleTransfer = useCallback(async () => {
    try {
      await transferOwnership({
        variables: {
          organizationId: organization.id,
          userId: node.user?.id ?? 0,
        },
        refetchQueries: ["OrganizationMembers"],
      });
    } catch (e) {
      message.error("Error occurred when transferring ownership: " + e.message);
    }
  }, [node.user, organization.id, transferOwnership]);

  const [transferBilling] = useTransferOrganizationBillingContactMutation();
  const handleBillingTransfer = useCallback(async () => {
    try {
      await transferBilling({
        variables: {
          organizationId: organization.id,
          userId: node.user?.id ?? 0,
        },
        refetchQueries: ["OrganizationMembers"],
      });
    } catch (e) {
      message.error(
        "Error occurred when transferring billing contact: " + e.message
      );
    }
  }, [node.user, organization.id, transferBilling]);

  const roles = [
    node.isOwner ? "owner" : null,
    node.isBillingContact ? "billing contact" : null,
  ]
    .filter(Boolean)
    .join(" and ");
  return (
    <List.Item
      actions={[
        organization.currentUserIsOwner && node.user?.id !== currentUser?.id ? (
          <Popconfirm
            title={`Are you sure you want to remove ${node.user?.name} from ${organization.name}?`}
            onConfirm={handleRemove}
            okText="Yes"
            cancelText="No"
            key="remove"
          >
            <a>Remove</a>
          </Popconfirm>
        ) : null,
        organization.currentUserIsOwner && node.user?.id !== currentUser?.id ? (
          <Popconfirm
            title={`Are you sure you want to transfer ownership of ${organization.name} to ${node.user?.name}?`}
            onConfirm={handleTransfer}
            okText="Yes"
            cancelText="No"
            key="transfer"
          >
            <a>Make owner</a>
          </Popconfirm>
        ) : null,
        organization.currentUserIsOwner && !node.isBillingContact ? (
          <Popconfirm
            title={`Are you sure you want to make ${node.user?.name} the billing contact for ${organization.name}?`}
            onConfirm={handleBillingTransfer}
            okText="Yes"
            cancelText="No"
            key="billingTransfer"
          >
            <a>Make billing contact</a>
          </Popconfirm>
        ) : null,
      ].filter(Boolean)}
    >
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
};

export default OrganizationSettingsPage;

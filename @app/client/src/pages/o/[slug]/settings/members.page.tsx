import {
  Heading,
  OrganizationSettingsLayout,
  PageHeader,
  Redirect,
  useOrganizationLoading,
  useOrganizationSlug,
} from "@app/client/src/components";
import {
  OrganizationMembers_MembershipFragment,
  OrganizationMembers_OrganizationFragment,
  SharedLayout_UserFragment,
  useInviteToOrganizationMutation,
  useOrganizationMembersQuery,
  useRemoveFromOrganizationMutation,
  useTransferOrganizationBillingContactMutation,
  useTransferOrganizationOwnershipMutation,
} from "@app/graphql";
import {
  Box,
  Button,
  Grid,
  Group,
  List,
  Pagination,
  Paper,
  Text,
  TextInput,
} from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import React, { useCallback, useState } from "react";
import { useForm } from "@mantine/hooks";
import { Popconfirm } from "@app/client/src/components/Popconfirm";

export { Page };

// This needs to match the `first:` used in OrganizationMembers.graphql
const RESULTS_PER_PAGE = 10;

const Page: React.FC = () => {
  const slug = useOrganizationSlug();
  const [page, setPage] = useState(1);
  const query = useOrganizationMembersQuery({
    variables: {
      slug,
      offset: (page - 1) * RESULTS_PER_PAGE,
    },
  });

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
            page={page}
            setPage={setPage}
          />
        )
      }
    </OrganizationSettingsLayout>
  );
};

interface OrganizationSettingsPageInnerProps {
  currentUser?: SharedLayout_UserFragment | null;
  organization: OrganizationMembers_OrganizationFragment;
  page: number;
  setPage: (newPage: number) => void;
}

const OrganizationSettingsPageInner: React.FC<OrganizationSettingsPageInnerProps> =
  (props) => {
    const { organization, currentUser, page, setPage } = props;

    const notifications = useNotifications();

    const renderItem = useCallback(
      (node: OrganizationMembers_MembershipFragment) => (
        <List.Item key={node.id}>
          <OrganizationMemberListItem
            node={node}
            organization={organization}
            currentUser={currentUser}
          />
        </List.Item>
      ),
      [currentUser, organization]
    );

    const [inviteToOrganization] = useInviteToOrganizationMutation();
    const [inviteInProgress, setInviteInProgress] = useState(false);

    const form = useForm({
      initialValues: {
        inviteText: "",
      },
    });

    const handleInviteSubmit = useCallback(
      async (values: typeof form.values) => {
        if (inviteInProgress) {
          return;
        }
        const { inviteText } = values;
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
          notifications.showNotification({
            message: `'${inviteText}' invited.`,
          });
          form.setFieldValue("inviteText", "");
        } catch (e) {
          // TODO: handle this through the interface
          notifications.showNotification({
            color: "red",
            message:
              "Could not invite to organization: " +
              e.message.replace(/^GraphQL Error:/i, ""),
          });
        } finally {
          setInviteInProgress(false);
        }
      },
      [form, inviteInProgress, inviteToOrganization, organization.id]
    );

    if (
      !organization.currentUserIsBillingContact &&
      !organization.currentUserIsOwner
    ) {
      return <Redirect href={`/o/${organization.slug}`} />;
    }

    const totalPages =
      Math.ceil(
        (organization.organizationMemberships?.totalCount || 0) /
          RESULTS_PER_PAGE
      ) || 1;

    return (
      <div>
        <PageHeader title="Members" />
        <Paper padding={"sm"}>
          <Heading order={5}>Invite new member</Heading>
          <form onSubmit={form.onSubmit(handleInviteSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  Username or email
                </Text>
                <TextInput
                  required
                  placeholder={"Enter username or email"}
                  sx={{ flexGrow: 1 }}
                  disabled={inviteInProgress}
                  {...form.getInputProps("inviteText")}
                />
              </Group>
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  &nbsp;
                </Text>
                <Button type="submit" disabled={inviteInProgress}>
                  Invite
                </Button>
              </Group>
            </Box>
          </form>
        </Paper>

        <Paper padding={"sm"} withBorder style={{ marginTop: "2rem" }}>
          <Heading order={5}>Existing members</Heading>
          <List
            listStyleType={"none"}
            style={{ marginBottom: "1rem", paddingLeft: "1rem" }}
          >
            {(organization.organizationMemberships?.nodes ?? []).map((node) =>
              renderItem(node)
            )}
          </List>
          <div style={{ display: "flex", justifyContent: "end" }}>
            <Pagination total={totalPages} page={page} onChange={setPage} />
          </div>
        </Paper>
      </div>
    );
  };

interface OrganizationMemberListItemProps {
  node: OrganizationMembers_MembershipFragment;
  organization: OrganizationMembers_OrganizationFragment;
  currentUser?: SharedLayout_UserFragment | null;
}

const OrganizationMemberListItem: React.FC<OrganizationMemberListItemProps> = (
  props
) => {
  const { node, organization, currentUser } = props;
  const notifications = useNotifications();

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
      notifications.showNotification({
        color: "red",
        message: "Error occurred when removing member: " + e.message,
      });
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
      notifications.showNotification({
        color: "red",
        message: "Error occurred when transferring ownership: " + e.message,
      });
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
      notifications.showNotification({
        color: "red",
        message:
          "Error occurred when transferring billing contact: " + e.message,
      });
    }
  }, [node.user, organization.id, transferBilling]);

  const roles = [
    node.isOwner ? "owner" : null,
    node.isBillingContact ? "billing contact" : null,
  ]
    .filter(Boolean)
    .join(" and ");

  const [showRemove, setShowRemove] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showBillingTransfer, setShowBillingTransfer] = useState(false);
  const actions = [
    organization.currentUserIsOwner && node.user?.id !== currentUser?.id ? (
      <Popconfirm
        opened={showRemove}
        onClose={() => setShowRemove(false)}
        target={<a onClick={() => setShowRemove(!showRemove)}>Remove</a>}
        title={`Are you sure you want to remove ${node.user?.name} from ${organization.name}?`}
        onConfirm={handleRemove}
        okText="Yes"
        cancelText="No"
        key="remove"
      />
    ) : null,
    organization.currentUserIsOwner && node.user?.id !== currentUser?.id ? (
      <Popconfirm
        opened={showTransfer}
        onClose={() => setShowTransfer(false)}
        target={
          <a onClick={() => setShowTransfer(!showTransfer)}>Make owner</a>
        }
        title={`Are you sure you want to transfer ownership of ${organization.name} to ${node.user?.name}?`}
        onConfirm={handleTransfer}
        okText="Yes"
        cancelText="No"
        key="transfer"
      />
    ) : null,
    organization.currentUserIsOwner && !node.isBillingContact ? (
      <Popconfirm
        opened={showBillingTransfer}
        onClose={() => setShowBillingTransfer(false)}
        target={
          <a onClick={() => setShowBillingTransfer(!showBillingTransfer)}>
            BillingTransfer
          </a>
        }
        title={`Are you sure you want to make ${node.user?.name} the billing contact for ${organization.name}?`}
        onConfirm={handleBillingTransfer}
        okText="Yes"
        cancelText="No"
        key="billingTransfer"
      />
    ) : null,
  ].filter(Boolean);

  return (
    <div>
      <Grid align={"center"}>
        <Grid.Col span={9}>
          <div>
            <Text>{node.user?.username}</Text>
            {roles ? (
              <div>
                <Text component={"small"}>({roles})</Text>
              </div>
            ) : null}
          </div>
        </Grid.Col>
        <Grid.Col span={3}>
          {actions.map((action, idx) => (
            <div key={idx}>{action}</div>
          ))}
        </Grid.Col>
      </Grid>
    </div>
  );
};

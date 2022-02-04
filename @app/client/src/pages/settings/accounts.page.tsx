import {
  Empty,
  ErrorAlert,
  PageHeader,
  SettingsLayout,
  SocialLoginOptions,
  SpinPadded,
  Strong,
} from "@app/client/src/components";
import {
  useCurrentUserAuthenticationsQuery,
  UserAuthentication,
  useSharedQuery,
  useUnlinkUserAuthenticationMutation,
} from "@app/graphql";
import {
  Avatar,
  Button,
  Card,
  Divider,
  Grid,
  List,
  Modal,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import React, { useCallback, useState } from "react";
import { AiFillGithub } from "react-icons/ai";

const AUTH_NAME_LOOKUP = {
  github: "GitHub",
  facebook: "Facebook",
  twitter: "Twitter",
};

function authName(service: string) {
  return AUTH_NAME_LOOKUP[service] || service;
}

const AUTH_ICON_LOOKUP = {
  github: <AiFillGithub />,
};

function authAvatar(service: string) {
  const icon = AUTH_ICON_LOOKUP[service] || null;
  if (icon) {
    return <Avatar size="lg">{icon}</Avatar>;
  }
}

function UnlinkAccountButton({ id }: { id: string }) {
  const [mutate] = useUnlinkUserAuthenticationMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);
  const handleUnlink = useCallback(async () => {
    setModalOpen(false);
    setDeleting(true);
    try {
      await mutate({ variables: { id } });
    } catch (e) {
      setDeleting(false);
    }
  }, [id, mutate]);

  return (
    <>
      <Modal
        title="Are you sure?"
        opened={modalOpen}
        onClose={handleCloseModal}
      >
        If you unlink this account you won't be able to log in with it any more;
        please make sure your email is valid.
        <Divider />
        <Button onClick={handleUnlink}>Confirm</Button>
        <Button variant={"subtle"} onClick={handleCloseModal}>
          Cancel
        </Button>
      </Modal>
      <a key="unlink" onClick={handleOpenModal}>
        {deleting ? <SpinPadded /> : "Unlink"}
      </a>
    </>
  );
}

function renderAuth(
  auth: Pick<UserAuthentication, "id" | "service" | "createdAt">
) {
  const actions = [<UnlinkAccountButton key="unlink" id={auth.id} />];
  return (
    <div key={auth.id}>
      <Grid align={"center"}>
        <Grid.Col span={1}>
          <Avatar
            size="md"
            styles={{
              placeholder: { backgroundColor: "transparent" },
            }}
          >
            {authAvatar(auth.service)}
          </Avatar>
        </Grid.Col>
        <Grid.Col span={8}>
          <Text size={"sm"}>
            <Strong>{authName(auth.service)}</Strong>
          </Text>
          <Text size={"sm"} color={"dimmed"}>
            {`Added ${new Date(Date.parse(auth.createdAt)).toLocaleString()}`}
          </Text>
        </Grid.Col>
        <Grid.Col span={3}>
          {actions.map((action, idx) => (
            <div key={idx}>{action}</div>
          ))}
        </Grid.Col>
      </Grid>
    </div>
  );
}

export { Page };

const Page: React.FC = () => {
  const { data, loading, error } = useCurrentUserAuthenticationsQuery();

  const linkedAccounts =
    loading || !data || !data.currentUser ? (
      <SpinPadded />
    ) : data.currentUser.authentications.length === 0 ? (
      <Empty />
    ) : (
      <Paper withBorder padding={"md"} style={{ marginTop: "1rem" }}>
        <List
          size="lg"
          listStyleType={"none"}
          withPadding={false}
          sx={() => ({
            ".mantine-List-itemWrapper > span": {
              display: "block",
              flexGrow: 1,
            },
          })}
        >
          {data.currentUser.authentications.map((auth) => renderAuth(auth))}
        </List>
      </Paper>
    );
  const query = useSharedQuery();

  return (
    <SettingsLayout href="/settings/accounts" query={query}>
      <PageHeader title="Linked accounts" />
      {error && !loading ? <ErrorAlert error={error} /> : linkedAccounts}
      <Card>
        <Title order={2} style={{ marginTop: 0 }}>
          Link another account
        </Title>
        <SocialLoginOptions
          next="/settings/accounts"
          buttonTextFromService={(service) => `Link ${service} account`}
        />
      </Card>
    </SettingsLayout>
  );
};

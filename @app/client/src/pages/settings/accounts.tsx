import { GithubFilled } from "@ant-design/icons";
import {
  ErrorAlert,
  SettingsLayout,
  SocialLoginOptions,
  SpinPadded,
  Strong,
} from "@app/components";
import {
  useCurrentUserAuthenticationsQuery,
  UserAuthentication,
  useSharedQuery,
  useUnlinkUserAuthenticationMutation,
} from "@app/graphql";
import { Avatar, Card, List, Modal, PageHeader, Spin } from "antd";
import { NextPage } from "next";
import React, { useCallback, useState } from "react";

const AUTH_NAME_LOOKUP = {
  github: "GitHub",
  facebook: "Facebook",
  twitter: "Twitter",
};
function authName(service: string) {
  return AUTH_NAME_LOOKUP[service] || service;
}

const AUTH_ICON_LOOKUP = {
  github: <GithubFilled />,
};
function authAvatar(service: string) {
  const icon = AUTH_ICON_LOOKUP[service] || null;
  if (icon) {
    return <Avatar size="large" icon={icon} />;
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
        visible={modalOpen}
        onCancel={handleCloseModal}
        onOk={handleUnlink}
      >
        If you unlink this account you won't be able to log in with it any more;
        please make sure your email is valid.
      </Modal>
      <a key="unlink" onClick={handleOpenModal}>
        {deleting ? <Spin /> : "Unlink"}
      </a>
    </>
  );
}

function renderAuth(
  auth: Pick<UserAuthentication, "id" | "service" | "createdAt">
) {
  return (
    <List.Item
      key={auth.id}
      actions={[<UnlinkAccountButton key="unlink" id={auth.id} />]}
    >
      <List.Item.Meta
        title={<Strong>{authName(auth.service)}</Strong>}
        description={`Added ${new Date(
          Date.parse(auth.createdAt)
        ).toLocaleString()}`}
        avatar={authAvatar(auth.service)}
      />
    </List.Item>
  );
}

const Settings_Accounts: NextPage = () => {
  const { data, loading, error } = useCurrentUserAuthenticationsQuery();

  const linkedAccounts =
    loading || !data || !data.currentUser ? (
      <SpinPadded />
    ) : (
      <List
        bordered
        size="large"
        dataSource={data.currentUser.authentications}
        renderItem={renderAuth}
      />
    );

  const query = useSharedQuery();

  return (
    <SettingsLayout href="/settings/accounts" query={query}>
      <PageHeader title="Linked accounts" />
      {error && !loading ? <ErrorAlert error={error} /> : linkedAccounts}
      <Card style={{ marginTop: "2rem" }} title="Link another account">
        <SocialLoginOptions
          next="/settings/accounts"
          buttonTextFromService={(service) => `Link ${service} account`}
        />
      </Card>
    </SettingsLayout>
  );
};

export default Settings_Accounts;

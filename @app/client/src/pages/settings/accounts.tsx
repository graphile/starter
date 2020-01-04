import React, { useCallback, useState } from "react";
import SettingsLayout from "../../layout/SettingsLayout";
import { NextPage } from "next";
import {
  useCurrentUserAuthenticationsQuery,
  useUnlinkUserAuthenticationMutation,
  UserAuthentication,
} from "@app/graphql";
import { Spin, List, Avatar, Modal } from "antd";
import {
  SocialLoginOptions,
  ErrorAlert,
  H3,
  H4,
  Strong,
} from "@app/components";

const AUTH_NAME_LOOKUP = {
  github: "GitHub",
  facebook: "Facebook",
  twitter: "Twitter",
};
function authName(service: string) {
  return AUTH_NAME_LOOKUP[service] || service;
}

const AUTH_ICON_LOOKUP = {
  github: "github",
};
function authAvatar(service: string) {
  const icon = AUTH_ICON_LOOKUP[service] || null;
  if (icon) {
    return <Avatar size="large" icon={icon} />;
  }
}

function UnlinkAccountButton({ id }: { id: number }) {
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
      <Spin />
    ) : (
      <List
        dataSource={data.currentUser.authentications}
        renderItem={renderAuth}
      />
    );

  return (
    <SettingsLayout href="/settings/accounts">
      <H3>Linked Accounts</H3>
      {error && !loading ? <ErrorAlert error={error} /> : linkedAccounts}
      <H4>Link another account</H4>
      <SocialLoginOptions
        next="/settings/accounts"
        buttonTextFromService={service => `Link ${service} account`}
      />
    </SettingsLayout>
  );
};

export default Settings_Accounts;

/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import React, { useCallback, useState } from "react";
import SettingsLayout from "../../components/SettingsLayout";
import {
  CurrentUserAuthenticationsComponent,
  UnlinkUserAuthenticationMutationComponent,
} from "../../graphql";
import { Spin, List, Avatar, Typography, Modal } from "antd";
import SocialLoginOptions from "../../components/SocialLoginOptions";

const { Text } = Typography;

const AUTH_NAME_LOOKUP = {
  github: "GitHub",
  facebook: "Facebook",
  twitter: "Twitter",
};
function authName(service: text) {
  return AUTH_NAME_LOOKUP[service] || service;
}

const AUTH_ICON_LOOKUP = {
  github: "github",
};
function authAvatar(service: text) {
  const icon = AUTH_ICON_LOOKUP[service] || null;
  if (icon) {
    return <Avatar size="large" icon={icon} />;
  }
}

function UnlinkAccountButtonInner({ id, mutate }: { id: number; mutate: any }) {
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

function UnlinkAccountButton({ id }: { id: number }) {
  return (
    <UnlinkUserAuthenticationMutationComponent>
      {mutate => <UnlinkAccountButtonInner id={id} mutate={mutate} />}
    </UnlinkUserAuthenticationMutationComponent>
  );
}

function renderAuth(auth) {
  return (
    <List.Item key={auth.id} actions={[<UnlinkAccountButton id={auth.id} />]}>
      <List.Item.Meta
        title={<Text strong>{authName(auth.service)}</Text>}
        description={`Added ${new Date(
          Date.parse(auth.createdAt)
        ).toLocaleString()}`}
        avatar={authAvatar(auth.service)}
      />
    </List.Item>
  );
}

export default function Settings_Accounts() {
  return (
    <SettingsLayout href="/settings/accounts">
      <h2>Linked Accounts</h2>
      <CurrentUserAuthenticationsComponent>
        {({ data }) => {
          if (!data.currentUser) {
            return <Spin />;
          }
          return (
            <List
              dataSource={data.currentUser.authentications}
              renderItem={renderAuth}
            />
          );
        }}
      </CurrentUserAuthenticationsComponent>
      <h3>Link another account</h3>
      <SocialLoginOptions
        next="/settings/accounts"
        buttonTextFromService={service => `Link ${service} account`}
      />
    </SettingsLayout>
  );
}

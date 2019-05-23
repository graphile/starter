/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import React from "react";
import SettingsLayout from "../../components/SettingsLayout";
import { CurrentUserAuthenticationsComponent } from "../../graphql";
import { Spin, List, Avatar, Typography } from "antd";
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

function renderAuth(auth) {
  return (
    <List.Item key={auth.id} actions={[<a key="unlink">Unlink</a>]}>
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

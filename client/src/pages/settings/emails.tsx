import React, { useState } from "react";
import SettingsLayout from "../../components/SettingsLayout";
import {
  SettingsEmailsQueryComponent,
  AddEmailMutationComponent,
  EmailsForm_UserEmailFragmentFragment,
} from "../../graphql";
import { List, Avatar } from "antd";
import Redirect from "../../components/Redirect";

function renderEmail(email: EmailsForm_UserEmailFragmentFragment) {
  const canDelete = !email.isPrimary;
  return (
    <List.Item
      key={email.id}
      actions={[
        canDelete && <a>Delete</a>,
        !email.isVerified && <a>Resend verification</a>,
        email.isVerified && !email.isPrimary && <a>Make primary</a>,
      ].filter(_ => _)}
    >
      <List.Item.Meta
        avatar={
          <Avatar size="large" style={{ backgroundColor: "transparent" }}>
            ✉️
          </Avatar>
        }
        title={
          <span>
            {" "}
            {email.email}{" "}
            <span
              title={
                email.isVerified
                  ? "Verified"
                  : "Pending verification (please check your inbox / spam folder"
              }
            >
              {" "}
              {email.isVerified ? "✅" : "❓"}{" "}
            </span>{" "}
          </span>
        }
        description={`Added ${new Date(
          Date.parse(email.createdAt)
        ).toLocaleString()}`}
      />
    </List.Item>
  );
}

export default function Settings_Emails() {
  const [email] = useState("");
  return (
    <SettingsLayout href="/settings/emails">
      <SettingsEmailsQueryComponent>
        {({ data, loading }) => {
          const user = data && data.currentUser;
          if (!user && !loading) {
            return <Redirect href={`/login?next=${"/settings/emails"}`} />;
          } else if (!user) {
            return "Loading";
          } else {
            return (
              <div>
                <List
                  dataSource={user.userEmails.nodes}
                  renderItem={renderEmail}
                />
                <AddEmailMutationComponent>
                  {mutate => (
                    <div>
                      <button onClick={() => mutate({ variables: { email } })}>
                        Add email
                      </button>
                    </div>
                  )}
                </AddEmailMutationComponent>
              </div>
            );
          }
        }}
      </SettingsEmailsQueryComponent>
    </SettingsLayout>
  );
}

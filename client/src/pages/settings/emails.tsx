import React, { useState } from "react";
import SettingsLayout from "../../components/SettingsLayout";
import {
  SettingsEmailsQueryComponent,
  AddEmailMutationComponent,
  EmailsForm_UserEmailFragmentFragment,
  ResendEmailVerificationMutationComponent,
  MakeEmailPrimaryMutationComponent,
  DeleteEmailMutationComponent,
} from "../../graphql";
import { List, Avatar } from "antd";
import Redirect from "../../components/Redirect";

function renderEmail(
  email: EmailsForm_UserEmailFragmentFragment,
  hasOtherEmails: boolean
) {
  const canDelete = !email.isPrimary && hasOtherEmails;
  return (
    <List.Item
      key={email.id}
      actions={[
        canDelete && (
          <DeleteEmailMutationComponent>
            {mutate => (
              <a onClick={() => mutate({ variables: { emailId: email.id } })}>
                Delete
              </a>
            )}
          </DeleteEmailMutationComponent>
        ),
        !email.isVerified && (
          <ResendEmailVerificationMutationComponent>
            {mutate => (
              <a onClick={() => mutate({ variables: { emailId: email.id } })}>
                Resend verification
              </a>
            )}
          </ResendEmailVerificationMutationComponent>
        ),
        email.isVerified && !email.isPrimary && (
          <MakeEmailPrimaryMutationComponent>
            {mutate => (
              <a onClick={() => mutate({ variables: { emailId: email.id } })}>
                Make primary
              </a>
            )}
          </MakeEmailPrimaryMutationComponent>
        ),
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
              {email.isVerified ? (
                "✅"
              ) : (
                <small style={{ color: "red" }}>(unverified)</small>
              )}{" "}
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
                  renderItem={email =>
                    renderEmail(email, user.userEmails.nodes.length > 1)
                  }
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

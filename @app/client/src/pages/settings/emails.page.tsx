import { ApolloError } from "@apollo/client";
import {
  ErrorAlert,
  Link,
  PageHeader,
  Redirect,
  SettingsLayout,
  Strong,
} from "@app/client/src/components";
import {
  EmailsForm_UserEmailFragment,
  useAddEmailMutation,
  useDeleteEmailMutation,
  useMakeEmailPrimaryMutation,
  useResendEmailVerificationMutation,
  useSettingsEmailsQuery,
} from "@app/graphql";
import { extractError, getCodeFromError } from "@app/lib";
import {
  Alert,
  Box,
  Button,
  Group,
  Text,
  TextInput,
  List,
  Grid,
  Avatar,
  Paper,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/hooks";
import React, { useCallback, useState } from "react";
import { AiOutlineWarning } from "react-icons/ai";

export { Page };

function Email({
  email,
  hasOtherEmails,
}: {
  email: EmailsForm_UserEmailFragment;
  hasOtherEmails: boolean;
}) {
  const canDelete = !email.isPrimary && hasOtherEmails;
  const [deleteEmail] = useDeleteEmailMutation();
  const [resendEmailVerification] = useResendEmailVerificationMutation();
  const [makeEmailPrimary] = useMakeEmailPrimaryMutation();
  const actions = [
    email.isPrimary && (
      <Text data-cy="settingsemails-indicator-primary">Primary</Text>
    ),
    canDelete && (
      <Link
        key={"delete"}
        onClick={() => deleteEmail({ variables: { emailId: email.id } })}
        data-cy="settingsemails-button-delete"
      >
        Delete
      </Link>
    ),
    !email.isVerified && (
      <Link
        key={"resend"}
        onClick={() =>
          resendEmailVerification({ variables: { emailId: email.id } })
        }
      >
        Resend verification
      </Link>
    ),
    email.isVerified && !email.isPrimary && (
      <Link
        key={"makePrimary"}
        onClick={() => makeEmailPrimary({ variables: { emailId: email.id } })}
        data-cy="settingsemails-button-makeprimary"
      >
        Make primary
      </Link>
    ),
  ].filter((_) => _);

  return (
    <div
      data-cy={`settingsemails-emailitem-${email.email.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      )}`}
      key={email.id}
    >
      <Grid align={"center"}>
        <Grid.Col span={1}>
          <Avatar
            size="md"
            styles={{
              placeholder: { backgroundColor: "transparent" },
            }}
          >
            ✉️
          </Avatar>
        </Grid.Col>
        <Grid.Col span={8}>
          <Text size={"sm"}>
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
          </Text>
          <Text size="sm" color={"dimmed"}>
            Added {new Date(Date.parse(email.createdAt)).toLocaleString()}
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

const Page: React.FC = () => {
  const [showAddEmailForm, setShowAddEmailForm] = useState(false);
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSettingsEmailsQuery();
  const { data, loading, error } = query;
  const user = data && data.currentUser;

  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!user && !loading) {
      return (
        <Redirect
          href={`/login?next=${encodeURIComponent("/settings/emails")}`}
        />
      );
    } else if (!user) {
      return "Loading";
    } else {
      return (
        <div>
          {user.isVerified ? null : (
            <div style={{ marginBottom: "0.5rem" }}>
              <Alert
                color={"orange"}
                icon={<AiOutlineWarning />}
                title="No verified emails"
              >
                You do not have any verified email addresses, this will make
                account recovery impossible and may limit your available
                functionality within this application. Please complete email
                verification.
              </Alert>
            </div>
          )}
          <PageHeader title="Email addresses" />
          <Text>
            <Strong>
              Account notices will be sent your primary email address.
            </Strong>{" "}
            Additional email addresses may be added to help with account
            recovery (or to change your primary email), but they cannot be used
            until verified.
          </Text>
          <Paper withBorder padding={"md"} style={{ marginTop: "1rem" }}>
            <List
              size="lg"
              listStyleType={"none"}
              withPadding={false}
              sx={(theme) => ({
                ".mantine-List-itemWrapper > span": {
                  display: "block",
                  flexGrow: 1,
                },
              })}
            >
              {user.userEmails.nodes.map((email) => (
                <List.Item key={email.id}>
                  <Email
                    key={email.id}
                    email={email}
                    hasOtherEmails={user.userEmails.nodes.length > 1}
                  />
                </List.Item>
              ))}
            </List>
            {!showAddEmailForm ? (
              <>
                <Divider style={{ marginBottom: "1rem" }} />
                <div>
                  <Button
                    onClick={() => setShowAddEmailForm(true)}
                    data-cy="settingsemails-button-addemail"
                  >
                    Add email
                  </Button>
                </div>
              </>
            ) : (
              <AddEmailForm
                onComplete={() => setShowAddEmailForm(false)}
                error={formError}
                setError={setFormError}
                onCancel={() => setShowAddEmailForm(false)}
              />
            )}
          </Paper>
        </div>
      );
    }
  })();

  return (
    <SettingsLayout href="/settings/emails" query={query}>
      {pageContent}
    </SettingsLayout>
  );
};

interface AddEmailFormProps {
  onComplete: () => void;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
  onCancel: () => void;
}

function AddEmailForm({
  error,
  setError,
  onComplete,
  onCancel,
}: AddEmailFormProps) {
  const form = useForm({
    initialValues: {
      email: "",
    },
  });
  const [addEmail] = useAddEmailMutation();
  const handleSubmit = useCallback(
    async (values: typeof form.values) => {
      try {
        setError(null);
        await addEmail({ variables: { email: values.email } });
        onComplete();
      } catch (e) {
        setError(e);
      }
    },
    [addEmail, onComplete, setError]
  );
  const code = getCodeFromError(error);
  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Group sx={{ gap: 12 }}>
          <Text align={"right"} sx={{ width: 150 }}>
            New email
          </Text>
          <TextInput
            required
            sx={{ flexGrow: 1 }}
            data-cy="settingsemails-input-email"
            {...form.getInputProps("email")}
          />
        </Group>
        {error ? (
          <Group sx={{ gap: 12 }}>
            <Text align={"right"} sx={{ width: 150 }}>
              &nbsp;
            </Text>
            <Alert color={"red"} title={"Error adding email"}>
              <span>
                {extractError(error).message}
                {code ? (
                  <span>
                    {" "}
                    (Error code: <code>ERR_{code}</code>)
                  </span>
                ) : null}
              </span>
            </Alert>
          </Group>
        ) : null}
        <Group sx={{ gap: 12 }}>
          <Text align={"right"} sx={{ width: 150 }}>
            &nbsp;
          </Text>
          <Button type="submit" data-cy="settingsemails-button-submit">
            Add email
          </Button>
          <Button variant={"subtle"} onClick={onCancel}>
            Cancel
          </Button>
        </Group>
      </Box>
    </form>
  );
}

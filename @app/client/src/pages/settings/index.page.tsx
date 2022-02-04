import { ApolloError } from "@apollo/client";
import {
  ErrorAlert,
  PageHeader,
  Redirect,
  SettingsLayout,
} from "@app/client/src/components";
import {
  ProfileSettingsForm_UserFragment,
  useSettingsProfileQuery,
  useUpdateUserMutation,
} from "@app/graphql";
import { extractError, getCodeFromError } from "@app/lib";
import { Alert, Box, Button, Group, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import React, { useCallback, useState } from "react";

export { Page };

const Page: React.FC = () => {
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSettingsProfileQuery();
  const { data, loading, error } = query;

  return (
    <SettingsLayout href="/settings" query={query}>
      {data && data.currentUser ? (
        <ProfileSettingsForm
          error={formError}
          setError={setFormError}
          user={data.currentUser}
        />
      ) : loading ? (
        "Loading..."
      ) : error ? (
        <ErrorAlert error={error} />
      ) : (
        <Redirect href={`/login?next=${encodeURIComponent("/settings")}`} />
      )}
    </SettingsLayout>
  );
};

interface ProfileSettingsFormProps {
  user: ProfileSettingsForm_UserFragment;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function ProfileSettingsForm({
  user,
  error,
  setError,
}: ProfileSettingsFormProps) {
  const form = useForm({
    initialValues: {
      name: user.name,
      username: user.username,
    },
  });
  const [updateUser] = useUpdateUserMutation();
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (values: typeof form.values) => {
      setSuccess(false);
      setError(null);
      try {
        await updateUser({
          variables: {
            id: user.id,
            patch: {
              username: values.username,
              name: values.name,
            },
          },
        });
        setError(null);
        setSuccess(true);
      } catch (e) {
        const errcode = getCodeFromError(e);
        if (errcode === "23505") {
          form.setFieldError(
            "username",
            "This username is already in use, please pick a different name"
          );
        } else {
          setError(e);
        }
      }
    },
    [setError, updateUser, user.id, form]
  );

  const code = getCodeFromError(error);
  return (
    <>
      <PageHeader title="Edit profile" />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Group sx={{ gap: 12 }}>
            <Text align={"right"} sx={{ width: 150 }}>
              Name
            </Text>
            <TextInput
              required
              sx={{ flexGrow: 1 }}
              {...form.getInputProps("name")}
            />
          </Group>
          <Group sx={{ gap: 12 }}>
            <Text align={"right"} sx={{ width: 150 }}>
              Username
            </Text>
            <TextInput
              required
              sx={{ flexGrow: 1 }}
              {...form.getInputProps("username")}
            />
          </Group>
          {error ? (
            <Group sx={{ gap: 12 }}>
              <Text align={"right"} sx={{ width: 150 }}>
                &nbsp;
              </Text>
              <Alert color={"red"} title={"Updating username"}>
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
          ) : success ? (
            <Group sx={{ gap: 12 }}>
              <Text align={"right"} sx={{ width: 150 }}>
                &nbsp;
              </Text>
              <Alert color={"teal"} title={`Profile updated`}>
                Your profile has been updated
              </Alert>
            </Group>
          ) : null}
          <Group sx={{ gap: 12 }}>
            <Text align={"right"} sx={{ width: 150 }}>
              &nbsp;
            </Text>
            <Button type="submit" data-cy="resetpage-submit-button">
              Update profile
            </Button>
          </Group>
        </Box>
      </form>
    </>
  );
}

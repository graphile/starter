import { ApolloError } from "@apollo/client";
import {
  ErrorAlert,
  Link,
  PageHeader,
  PasswordStrength,
  SettingsLayout,
} from "@app/client/src/components";
import {
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useSettingsPasswordQuery,
  useSharedQuery,
} from "@app/graphql";
import { extractError, getCodeFromError } from "@app/lib";
import { Alert, Box, Button, Group, PasswordInput, Text } from "@mantine/core";
import { useForm } from "@mantine/hooks";
import React, { useCallback, useState } from "react";

export { Page };

const Page: React.FC = () => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const query = useSharedQuery();
  const form = useForm({
    initialValues: {
      oldPassword: "",
      newPassword: "",
    },
  });
  const [changePassword] = useChangePasswordMutation();
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (values: typeof form.values) => {
      setSuccess(false);
      setError(null);
      try {
        await changePassword({
          variables: {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
          },
        });
        setError(null);
        setSuccess(true);
        form.reset();
      } catch (e) {
        const errcode = getCodeFromError(e);
        if (errcode === "WEAKP") {
          form.setFieldError(
            "newPassword",
            "The server believes this passphrase is too weak, please make it stronger"
          );
        } else if (errcode === "CREDS") {
          form.setFieldError("oldPassword", "Incorrect old passphrase");
        } else {
          setError(e);
        }
      }
    },
    [changePassword, form, setError]
  );

  const {
    data,
    error: graphqlQueryError,
    loading,
  } = useSettingsPasswordQuery();
  const [forgotPassword] = useForgotPasswordMutation();
  const u = data && data.currentUser;
  const userEmail = u && u.userEmails.nodes[0];
  const email = userEmail ? userEmail.email : null;
  const [resetInProgress, setResetInProgress] = useState(false);
  const [resetError, setResetError] = useState(null);
  const handleResetPassword = useCallback(() => {
    if (!email) return;
    if (resetInProgress) return;
    (async () => {
      setResetInProgress(true);

      try {
        await forgotPassword({ variables: { email } });
      } catch (e) {
        setResetError(resetError);
      }
      setResetInProgress(false);
    })();
  }, [email, forgotPassword, resetError, resetInProgress]);

  const inner = () => {
    if (loading) {
      /* noop */
    } else if (graphqlQueryError) {
      return <ErrorAlert error={graphqlQueryError} />;
    } else if (data && data.currentUser && !data.currentUser.hasPassword) {
      return (
        <div>
          <PageHeader title="Change passphrase" />
          <Text>
            You registered your account through social login, so you do not
            currently have a passphrase. If you would like a passphrase, press
            the button below to request a passphrase reset email to '{email}'
            (you can choose a different email by making it primary in{" "}
            <Link href="/settings/emails">email settings</Link>).
          </Text>
          <Button onClick={handleResetPassword} disabled={resetInProgress}>
            Reset passphrase
          </Button>
        </div>
      );
    }
    const code = getCodeFromError(error);

    return (
      <div>
        <PageHeader title="Change passphrase" />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Group sx={{ gap: 12 }}>
              <Text align={"right"} sx={{ width: 150 }}>
                Old passphrase
              </Text>
              <PasswordInput
                required
                sx={{ flexGrow: 1 }}
                {...form.getInputProps("oldPassword")}
              />
            </Group>
            <Group sx={{ gap: 12 }}>
              <Text align={"right"} sx={{ width: 150 }}>
                New passphrase
              </Text>
              <Box sx={{ flexGrow: 1 }}>
                <PasswordStrength
                  required
                  autoComplete="new-password"
                  onBlur={() => {
                    form.validateField("newPassword");
                  }}
                  {...form.getInputProps("newPassword")}
                />
              </Box>
            </Group>
            {error ? (
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  &nbsp;
                </Text>
                <Alert color={"red"} title={"Changing passphrase failed"}>
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
              <Alert color={"teal"} title={`Password changed!`}>
                Your password has been changed successfully.
              </Alert>
            ) : null}
            <Group sx={{ gap: 12 }}>
              <Text align={"right"} sx={{ width: 150 }}>
                &nbsp;
              </Text>
              <Button type="submit">Change Passphrase</Button>
            </Group>
          </Box>
        </form>
      </div>
    );
  }; //inner
  return (
    <SettingsLayout href="/settings/security" query={query}>
      {inner()}
    </SettingsLayout>
  );
};

import {
  AuthRestrict,
  passwordRequirements,
  PasswordStrength,
  SharedLayout,
} from "@app/client/src/components";
import { PageContext } from "@app/client/src/renderer/types";
import { usePageContext } from "@app/client/src/renderer/usePageContext";
import get from "lodash/get";
import { useResetPasswordMutation, useSharedQuery } from "@app/graphql";
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/hooks";
import React, { useCallback, useState } from "react";
import { PageContextBuiltInClient } from "vite-plugin-ssr/client/router";

export { Page };

enum State {
  PENDING = "PENDING",
  SUBMITTING = "SUBMITTING",
  SUCCESS = "SUCCESS",
}

const Page: React.FC = () => {
  const [error, setError] = useState<Error | null>(null);

  const [state, setState] = useState<State>(State.PENDING);
  const query = useSharedQuery();
  const {
    urlParsed: {
      // @ts-ignore
      search: { user_id: rawUserId, token: rawToken },
    },
  } = usePageContext() as Partial<
    PageContextBuiltInClient &
      PageContext & { urlParsed: { search: Record<string, string> } }
  >;

  const form = useForm({
    initialValues: {
      userId: rawUserId,
      token: rawToken,
      password: "",
      confirm: "",
    },
    validationRules: {
      password: (password) =>
        passwordRequirements.every((req) => password.trim().match(req.re)),
      confirm: (confirm, values) => confirm === values?.password,
    },
    errorMessages: {
      password: "Invalid password",
      confirm: "Passwords must match",
    },
  });

  const [resetPassword] = useResetPasswordMutation();

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const handleSubmit = useCallback(
    (values: typeof form.values) => {
      setState(State.SUBMITTING);
      setError(null);
      (async () => {
        try {
          const result = await resetPassword({
            variables: {
              userId: rawUserId,
              token: values.token,
              password: values.password,
            },
          });
          if (get(result, "data.resetPassword.success")) {
            setState(State.SUCCESS);
          } else {
            setState(State.PENDING);
            setError(new Error("Incorrect token, please check and try again"));
          }
        } catch (e) {
          if (e.message) {
            setError(e);
          } else {
            setError(new Error("Please check the errors above and try again"));
            console.dir(e);
          }
          setState(State.PENDING);
        }
      })();
    },
    [resetPassword, form.values.token, form.values.userId]
  );

  return (
    <SharedLayout
      title="Reset Password"
      query={query}
      forbidWhen={
        // reset is used to change password of OAuth-authenticated users
        AuthRestrict.NEVER
      }
    >
      <Grid grow>
        <Grid.Col>
          <div>
            {state === "SUBMITTING" ? (
              <Alert color={"blue"} title="Submitting...">
                This might take a few moments...
              </Alert>
            ) : state === "SUCCESS" ? (
              <Alert color={"teal"} title="Password Reset">
                Your password was reset; you can go and log in now
              </Alert>
            ) : null}
          </div>
          <form
            onSubmit={form.onSubmit(handleSubmit)}
            style={{ display: state === State.PENDING ? "" : "none" }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  Enter your reset token
                </Text>
                <TextInput
                  required
                  sx={{ flexGrow: 1 }}
                  {...form.getInputProps("token")}
                />
              </Group>
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  Choose a new passphrase:
                </Text>
                <Box sx={{ flexGrow: 1 }}>
                  <PasswordStrength
                    required
                    autoComplete="new-password"
                    data-cy="registerpage-input-password"
                    onBlur={() => {
                      form.validateField("password");
                    }}
                    {...form.getInputProps("password")}
                  />
                </Box>
              </Group>
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  <span>Confirm passphrase</span>
                </Text>
                <PasswordInput
                  required
                  type="password"
                  autoComplete="new-password"
                  data-cy="registerpage-input-password2"
                  sx={{ flexGrow: 1 }}
                  onBlur={() => {
                    form.validateField("confirm");
                  }}
                  {...form.getInputProps("confirm")}
                />
              </Group>
              {error ? (
                <Group sx={{ gap: 12 }}>
                  <Text align={"right"} sx={{ width: 150 }}>
                    &nbsp;
                  </Text>
                  <Alert color={"red"} withCloseButton onClose={clearError}>
                    {error.message ? String(error.message) : String(error)}
                  </Alert>
                </Group>
              ) : null}
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  &nbsp;
                </Text>
                <Button type="submit" data-cy="resetpage-submit-button">
                  Reset passphrase
                </Button>
              </Group>
            </Box>
          </form>
        </Grid.Col>
      </Grid>
    </SharedLayout>
  );
};

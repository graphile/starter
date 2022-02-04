import { ApolloError, useApolloClient } from "@apollo/client";
import {
  AuthRestrict,
  passwordRequirements,
  PasswordStrength,
  Redirect,
  SharedLayout,
} from "@app/client/src/components";
import { PageContext } from "@app/client/src/renderer/types";
import { usePageContext } from "@app/client/src/renderer/usePageContext";
import { useRegisterMutation, useSharedQuery } from "@app/graphql";
import {
  extractError,
  getCodeFromError,
  getExceptionFromError,
} from "@app/lib";
import {
  Alert,
  Box,
  Button,
  Group,
  PasswordInput,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/hooks";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import {
  navigate,
  PageContextBuiltInClient,
} from "vite-plugin-ssr/client/router";

import { resetWebsocketConnection } from "../renderer/makeApolloClient";

export { Page };

function isSafe(nextUrl: string | null) {
  return (nextUrl && nextUrl[0] === "/") || false;
}

/**
 * The registration page just renders the standard layout and embeds the
 * registration form.
 */
const Page: React.FC = () => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const {
    urlParsed: {
      // @ts-ignore
      search: { next: rawNext },
    },
  } = usePageContext() as Partial<
    PageContextBuiltInClient &
      PageContext & { urlParsed: { search: Record<string, string> } }
  >;
  const next: string = isSafe(rawNext) ? rawNext! : "/";
  const query = useSharedQuery();

  const [register] = useRegisterMutation({});
  const client = useApolloClient();

  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      name: "",
      confirm: "",
    },
    validationRules: {
      email: (value) => /^\S+@\S+$/.test(value),
      username: (username) =>
        Boolean(
          username.trim().length >= 2 &&
            username.trim().length <= 24 &&
            username.trim().match(/^([a-zA-Z]|$)/) &&
            username.trim().match(/^([^_]|_[^_]|_$)*$/) &&
            username.trim().match(/^[a-zA-Z0-9_]*$/)
        ),
      password: (password) =>
        passwordRequirements.every((req) => password.trim().match(req.re)),
      confirm: (confirm, values) => confirm === values?.password,
    },
    errorMessages: {
      email: "Invalid email",
      username:
        "Username must be between 2-24 characters and only contain alphanumerics",
      password: "Invalid password",
      confirm: "Passwords must match",
    },
  });

  const focusElement = useRef<HTMLInputElement>(null);
  useEffect(
    () => void (focusElement.current && focusElement.current!.focus()),
    [focusElement]
  );

  const handleSubmit = useCallback(
    async (values: {
      username: string;
      email: string;
      password: string;
      name: string;
    }) => {
      try {
        await register({
          variables: {
            username: values.username,
            email: values.email,
            password: values.password,
            name: values.name,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        await client.resetStore();
        // Don't await navigate
        navigate(next);
      } catch (e) {
        const code = getCodeFromError(e);
        const exception = getExceptionFromError(e);
        const fields: any = exception && exception["fields"];
        if (code === "WEAKP") {
          form.setFieldError(
            "password",
            "The server believes this passphrase is too weak, please make it stronger"
          );
        } else if (code === "EMTKN") {
          form.setFieldError(
            "email",
            "An account with this email address has already been registered, consider using the 'Forgot passphrase' function."
          );
        } else if (code === "NUNIQ" && fields && fields[0] === "username") {
          form.setFieldError(
            "username",
            "An account with this username has already been registered, please try a different username."
          );
        } else if (code === "23514") {
          form.setFieldError(
            "username",
            "This username is not allowed; usernames must be between 2 and 24 characters long (inclusive), must start with a letter, and must contain only alphanumeric characters and underscores."
          );
        } else {
          setError(e);
        }
      }
    },
    [form, register, client, next]
  );

  const code = getCodeFromError(error);

  return (
    <SharedLayout
      title="Register"
      query={query}
      forbidWhen={AuthRestrict.LOGGED_IN}
    >
      {({ currentUser }) =>
        currentUser ? (
          <Redirect href={next} />
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  <span data-cy="registerpage-name-label">
                    Name&nbsp;
                    <Tooltip label={"What is your name?"}>
                      <AiOutlineQuestionCircle />
                    </Tooltip>
                  </span>
                </Text>
                <TextInput
                  required
                  ref={focusElement}
                  autoComplete="name"
                  data-cy="registerpage-input-name"
                  sx={{ flexGrow: 1 }}
                  {...form.getInputProps("name")}
                />
              </Group>
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  <span>
                    Username&nbsp;
                    <Tooltip label={"What do you want others to call you?"}>
                      <AiOutlineQuestionCircle />
                    </Tooltip>
                  </span>
                </Text>
                <TextInput
                  required
                  autoComplete="username"
                  data-cy="registerpage-input-username"
                  sx={{ flexGrow: 1 }}
                  {...form.getInputProps("username")}
                />
              </Group>
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  <span>E-mail</span>
                </Text>
                <TextInput
                  required
                  autoComplete="email"
                  data-cy="registerpage-input-email"
                  sx={{ flexGrow: 1 }}
                  {...form.getInputProps("email")}
                />
              </Group>
              <Group sx={{ gap: 12 }}>
                <Text align={"right"} sx={{ width: 150 }}>
                  <span>Passphrase</span>
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
                  <Alert color={"red"} title={`Registration failed`}>
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
                <Button type="submit" data-cy="registerpage-submit-button">
                  Register
                </Button>
              </Group>
            </Box>
          </form>
        )
      }
    </SharedLayout>
  );
};

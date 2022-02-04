import { ApolloError, useApolloClient } from "@apollo/client";
import {
  AuthRestrict,
  ButtonLink,
  Link,
  Redirect,
  SharedLayout,
  SharedLayoutChildProps,
  SocialLoginOptions,
} from "@app/client/src/components";
import { PageContext } from "@app/client/src/renderer/types";
import { usePageContext } from "@app/client/src/renderer/usePageContext";
import { useLoginMutation, useSharedQuery } from "@app/graphql";
import { extractError, getCodeFromError } from "@app/lib";
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/hooks";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineLock, AiOutlineUser, AiOutlineUserAdd } from "react-icons/ai";
import {
  navigate,
  PageContextBuiltInClient,
} from "vite-plugin-ssr/client/router";

import { resetWebsocketConnection } from "../renderer/makeApolloClient";

export { Page };

export function isSafe(nextUrl: string | null) {
  return (nextUrl && nextUrl[0] === "/") || false;
}

/**
 * Login page just renders the standard layout and embeds the login form
 */
const Page: React.FC = () => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const query = useSharedQuery();
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

  return (
    <SharedLayout
      title="Sign in"
      query={query}
      forbidWhen={AuthRestrict.LOGGED_IN}
    >
      {({ currentUser }: SharedLayoutChildProps) =>
        currentUser ? (
          <Redirect href={next} />
        ) : (
          <Grid justify={"center"} style={{ marginTop: 32 }}>
            {showLogin ? (
              <Grid.Col md={6}>
                <LoginForm
                  onSuccessRedirectTo={next}
                  onCancel={() => setShowLogin(false)}
                  error={error}
                  setError={setError}
                />
              </Grid.Col>
            ) : (
              <Grid.Col md={6}>
                <Grid style={{ marginBottom: 8 }}>
                  <Grid.Col span={12}>
                    <Button
                      data-cy="loginpage-button-withusername"
                      leftIcon={<AiOutlineUser />}
                      size={"lg"}
                      fullWidth
                      onClick={() => setShowLogin(true)}
                    >
                      Sign in with E-mail or Username
                    </Button>
                  </Grid.Col>
                </Grid>
                <Grid style={{ marginBottom: 8 }}>
                  <Grid.Col span={12}>
                    <SocialLoginOptions next={next} />
                  </Grid.Col>
                </Grid>
                <Grid style={{ marginBottom: 8 }}>
                  <Grid.Col span={12}>
                    <ButtonLink
                      leftIcon={<AiOutlineUserAdd />}
                      variant={"outline"}
                      size={"lg"}
                      fullWidth
                      href={`/register?next=${encodeURIComponent(next)}`}
                      data-cy="loginpage-button-register"
                    >
                      Create an account
                    </ButtonLink>
                  </Grid.Col>
                </Grid>
              </Grid.Col>
            )}
          </Grid>
        )
      }
    </SharedLayout>
  );
};

interface LoginFormProps {
  onSuccessRedirectTo: string;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
  onCancel: () => void;
}

function LoginForm({
  onSuccessRedirectTo,
  onCancel,
  error,
  setError,
}: LoginFormProps) {
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
  });
  const [login] = useLoginMutation({});
  const client = useApolloClient();

  const handleSubmit = useCallback(
    async (values: typeof form.values) => {
      setError(null);
      try {
        await login({
          variables: {
            username: values.username,
            password: values.password,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        await client.resetStore();
        // Don't await navigate()
        navigate(onSuccessRedirectTo);
      } catch (e) {
        const code = getCodeFromError(e);
        if (code === "CREDS") {
          form.setFieldError("password", "Incorrect username or passphrase");
        } else {
          setError(e);
        }
      }
    },
    [client, form, login, onSuccessRedirectTo, setError]
  );

  const focusElement = useRef<HTMLInputElement>(null);
  useEffect(
    () => void (focusElement.current && focusElement.current!.focus()),
    [focusElement]
  );

  const code = getCodeFromError(error);

  return (
    <form style={{ width: "100%" }} onSubmit={form.onSubmit(handleSubmit)}>
      <Group direction={"column"} spacing={"lg"} grow>
        <TextInput
          required
          placeholder={"E-mail or Username"}
          icon={<AiOutlineUser />}
          autoComplete="email username"
          ref={focusElement}
          data-cy="loginpage-input-username"
          {...form.getInputProps("username")}
        />
        <PasswordInput
          required
          icon={<AiOutlineLock />}
          placeholder={"Passphrase"}
          autoComplete="current-password"
          data-cy="loginpage-input-password"
          {...form.getInputProps("password")}
        />
        <Box>
          <Link href="/forgot">Forgotten passphrase?</Link>
        </Box>

        {error ? (
          <Alert color={"red"} title={`Sign in failed`}>
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
        ) : null}
        <Box>
          <Button type="submit" data-cy="loginpage-button-submit">
            Sign in
          </Button>
          <a style={{ marginLeft: 16 }} onClick={onCancel}>
            Use a different sign in method
          </a>
        </Box>
      </Group>
    </form>
  );
}

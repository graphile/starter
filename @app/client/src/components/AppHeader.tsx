import { QueryResult, useApolloClient } from "@apollo/client";
import { usePageContext } from "@app/client/src/renderer/usePageContext";
import type { SharedLayout_QueryFragment } from "@app/graphql";
import { useLogoutMutation } from "@app/graphql";
import {
  Anchor,
  Avatar,
  Grid,
  Group,
  Header,
  Menu,
  Title,
  UnstyledButton,
  UnstyledButtonProps,
} from "@mantine/core";
import React, { forwardRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { AiOutlineCrown, AiOutlineDown } from "react-icons/ai";
import { navigate } from "vite-plugin-ssr/client/router";

import { AuthRestrict, Warn } from "../components";
import { appConfig } from "../helpers";

const { projectName } = appConfig;

type SharedQueryType = Pick<
  QueryResult<SharedLayout_QueryFragment>,
  "data" | "loading" | "error" | "networkStatus" | "client" | "refetch"
>;

export interface AppHeaderProps {
  title?: string;
  titleHref?: string;
  titleHrefAs?: string;
  query: SharedQueryType;
  noPad?: boolean;
  noHandleErrors?: boolean;
  forbidWhen?: AuthRestrict;
}

interface UserButtonProps extends UnstyledButtonProps {
  isVerified: boolean;
}
const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ name, isVerified, ...others }: UserButtonProps, ref) => (
    <UnstyledButton
      ref={ref}
      sx={(theme) => ({
        display: "block",
        paddingLeft: theme.spacing.md,
        paddingRight: theme.spacing.md,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
      })}
      {...others}
    >
      <Group
        data-cy="layout-dropdown-user"
        noWrap
        sx={{ alignItems: "center" }}
      >
        <Avatar size={"md"} radius={"xl"}>
          {(name && name[0]) || "?"}
        </Avatar>
        <div style={{ flexGrow: 1 }}>{name}</div>

        <Warn okay={isVerified}>
          <AiOutlineDown size={16} />
        </Warn>
      </Group>
    </UnstyledButton>
  )
);
UserButton.displayName = "UserButton";

export function AppHeader({
  title,
  query,
  titleHref,
  forbidWhen = AuthRestrict.NEVER,
}: AppHeaderProps) {
  const { urlPathname: currentUrl } = usePageContext();
  const client = useApolloClient();
  const [logout] = useLogoutMutation({ client: client });

  const handleLogout = useCallback(async () => {
    const reset = async () => {
      try {
        await logout();
        await client.resetStore();
      } catch (e) {
        console.error(e);
        // Something went wrong; redirect to /logout to force logout.
        window.location.href = "/logout";
      }
    };
    await reset();
    // Don't await navigate(), it'll cause
    // "Can't perform a react state update on unmounted component"
    navigate("/");
  }, [client, logout]);

  const forbidsLoggedIn = forbidWhen & AuthRestrict.LOGGED_IN;
  const { data } = query as SharedQueryType;

  return (
    <Header
      height={"md"}
      padding={"xs"}
      sx={(theme) => ({
        paddingLeft: theme.spacing.xl,
        paddingRight: theme.spacing.xl,
      })}
    >
      <Helmet>
        <title>{title ? `${title} — ${projectName}` : projectName}</title>
      </Helmet>
      <div>
        <Grid align={"center"} grow>
          <Grid.Col span={3}>
            <Anchor href="/">{projectName}</Anchor>
          </Grid.Col>
          <Grid.Col span={3}>
            <Title
              order={3}
              style={{
                margin: 0,
                padding: 0,
                textAlign: "center",
                lineHeight: "48px",
              }}
              data-cy="layout-header-title"
            >
              {titleHref ? (
                <Anchor href={titleHref} data-cy="layout-header-titlelink">
                  {title}
                </Anchor>
              ) : (
                title
              )}
            </Title>
          </Grid.Col>
          <Grid.Col span={3} style={{ textAlign: "right" }}>
            {data && data.currentUser ? (
              <Menu
                control={
                  <UserButton
                    isVerified={data.currentUser.isVerified}
                    name={data.currentUser.name || undefined}
                  />
                }
              >
                {data.currentUser.organizationMemberships.nodes.map(
                  ({ organization, isOwner }) => (
                    <Menu.Item key={organization?.id}>
                      <Anchor href={`/o/${organization?.slug}`}>
                        {organization?.name}
                        {isOwner ? (
                          <span>
                            {" "}
                            <AiOutlineCrown />
                          </span>
                        ) : (
                          ""
                        )}
                      </Anchor>
                    </Menu.Item>
                  )
                )}
                <Menu.Item>
                  <Anchor
                    data-cy="layout-link-create-organization"
                    href="/create-organization"
                  >
                    Create organization
                  </Anchor>
                </Menu.Item>
                <Menu.Item>
                  <Anchor data-cy="layout-link-settings" href="/settings">
                    <Warn okay={data.currentUser.isVerified}>Settings</Warn>
                  </Anchor>
                </Menu.Item>
                <Menu.Item onClick={handleLogout}>
                  <Anchor>Logout</Anchor>
                </Menu.Item>
              </Menu>
            ) : forbidsLoggedIn ? null : (
              <Anchor
                data-cy="header-login-button"
                href={`/login?next=${encodeURIComponent(currentUrl)}`}
              >
                Sign in
              </Anchor>
            )}
          </Grid.Col>
        </Grid>
      </div>
    </Header>
  );
}

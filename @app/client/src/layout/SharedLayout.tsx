import * as React from "react";
import {
  Layout,
  Avatar,
  Row,
  Col,
  Dropdown,
  Icon,
  Menu,
  Typography,
} from "antd";
import Link from "next/link";
import { projectName, companyName } from "@app/config";
import {
  useSharedLayoutQuery,
  useLogoutMutation,
  useCurrentUserUpdatedSubscription,
  SharedLayout_UserFragment,
} from "@app/graphql";
import Router from "next/router";
import { useApolloClient } from "@apollo/react-hooks";
import { useCallback } from "react";
import { StandardWidth, Warn, ErrorAlert } from "@app/components";
import Head from "next/head";
import { ApolloError } from "apollo-client";

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

/*
 * For some reason, possibly related to the interaction between
 * `babel-plugin-import` and https://github.com/babel/babel/pull/9766, we can't
 * directly export these values, but if we reference them and re-export then we
 * can.
 *
 * TODO: change back to `export { Row, Col, Link }` when this issue is fixed.
 */
const _babelHackRow = Row;
const _babelHackCol = Col;
export { _babelHackRow as Row, _babelHackCol as Col, Link };

export interface SharedLayoutChildProps {
  error?: ApolloError | Error;
  loading: boolean;
  currentUser?: SharedLayout_UserFragment | null;
}

interface SharedLayoutProps {
  title: string;
  children:
    | React.ReactNode
    | ((props: SharedLayoutChildProps) => React.ReactNode);
  noPad?: boolean;
}

/* The Apollo `useSubscription` hook doesn't currently allow skipping the
 * subscription; we only want it when the user is logged in, so we conditionally
 * call this stub component.
 */
function CurrentUserUpdatedSubscription() {
  /*
   * This will set up a GraphQL subscription monitoring for changes to the
   * current user. Interestingly we don't need to actually _do_ anything - no
   * rendering or similar - because the payload of this mutation will
   * automatically update Apollo's cache which will cause the data to be
   * re-rendered wherever appropriate.
   */
  useCurrentUserUpdatedSubscription();
  return null;
}

function SharedLayout({ title, noPad = false, children }: SharedLayoutProps) {
  const client = useApolloClient();
  const [logout] = useLogoutMutation();
  const handleLogout = useCallback(async () => {
    await logout();
    client.resetStore();
    Router.push("/");
  }, [client, logout]);
  const renderChildren = (props: SharedLayoutChildProps) => {
    const inner =
      props.error && !props.loading ? (
        <ErrorAlert error={props.error} />
      ) : typeof children === "function" ? (
        children(props)
      ) : (
        children
      );
    return noPad ? inner : <StandardWidth>{inner}</StandardWidth>;
  };
  const { data, loading, error } = useSharedLayoutQuery();

  return (
    <Layout>
      {data && data.currentUser ? <CurrentUserUpdatedSubscription /> : null}
      <Header style={{ boxShadow: "0 2px 8px #f0f1f2", zIndex: 1 }}>
        <Head>
          <title>
            {title} — {projectName}
          </title>
        </Head>
        <Row type="flex" justify="space-between">
          <Col span={6}>
            <Link href="/">
              <a>Home</a>
            </Link>
          </Col>
          <Col>
            <h3>{title}</h3>
          </Col>
          <Col span={6} style={{ textAlign: "right" }}>
            {data && data.currentUser ? (
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item>
                      <Link href="/settings">
                        <a data-cy="layout-link-settings">
                          <Warn okay={data.currentUser.isVerified}>
                            Settings
                          </Warn>
                        </a>
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <a onClick={handleLogout}>Logout</a>
                    </Menu.Item>
                  </Menu>
                }
              >
                <span
                  data-cy="layout-dropdown-user"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Avatar>
                    {(data.currentUser.name && data.currentUser.name[0]) || "?"}
                  </Avatar>
                  <Warn okay={data.currentUser.isVerified}>
                    <span style={{ marginLeft: 8, marginRight: 8 }}>
                      {data.currentUser.name}
                    </span>
                    <Icon type="down" />
                  </Warn>
                </span>
              </Dropdown>
            ) : (
              <Link href="/login">
                <a data-cy="header-login-button">Sign in</a>
              </Link>
            )}
          </Col>
        </Row>
      </Header>
      <Content style={{ minHeight: "calc(100vh - 64px - 120px)" }}>
        {renderChildren({
          error,
          loading,
          currentUser: data && data.currentUser,
        })}
      </Content>
      <Footer>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "#fff" }}>
            Copyright &copy; {new Date().getFullYear()} {companyName}. All
            rights reserved.
            {process.env.T_AND_C_URL ? (
              <span>
                {" "}
                <a
                  style={{ color: "#fff", textDecoration: "underline" }}
                  href={process.env.T_AND_C_URL}
                >
                  Terms and conditions
                </a>
              </span>
            ) : null}
          </Text>
          <Text style={{ color: "#fff" }}>
            Powered by{" "}
            <a
              style={{ color: "#fff", textDecoration: "underline" }}
              href="https://graphile.org/postgraphile"
            >
              PostGraphile
            </a>
          </Text>
        </div>
      </Footer>
    </Layout>
  );
}

export default SharedLayout;

/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import * as React from "react";
import { Layout, Row, Col, Dropdown, Icon, Menu } from "antd";
import Link from "next/link";
import { companyName } from "../../../backend/src/config";
import {
  useSharedLayoutQuery,
  useLogoutMutation,
  useCurrentUserUpdatedSubscription,
  SharedLayout_UserFragment,
} from "../graphql";
import Router from "next/router";
import { useApolloClient } from "@apollo/react-hooks";
import { useCallback } from "react";
import StandardWidth from "./StandardWidth";
import Head from "next/head";
import Warn from "./Warn";

const { Header, Content, Footer } = Layout;

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

function SharedLayout({ title, noPad = false, children }: SharedLayoutProps) {
  const client = useApolloClient();
  const [logout] = useLogoutMutation();
  const handleLogout = useCallback(async () => {
    await logout();
    client.resetStore();
    Router.push("/");
  }, [client, logout]);
  const renderChildren = (props: SharedLayoutChildProps) => {
    const inner = typeof children === "function" ? children(props) : children;
    return noPad ? inner : <StandardWidth>{inner}</StandardWidth>;
  };
  const { data, loading } = useSharedLayoutQuery();

  /*
   * This will set up a GraphQL subscription monitoring for changes to the
   * current user. Interestingly we don't need to actually _do_ anything - no
   * rendering or similar - because the payload of this mutation will
   * automatically update Apollo's cache which will cause the data to be
   * re-rendered wherever appropriate.
   */
  useCurrentUserUpdatedSubscription();

  return (
    <Layout>
      <Header>
        <Head>
          <title>
            {title} — {companyName}
          </title>
        </Head>
        <Row type="flex" justify="space-between">
          <Col span={6}>
            <Link href="/">
              <span>Home</span>
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
                        <a>
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
                <span>
                  <Warn okay={data.currentUser.isVerified}>
                    {data.currentUser.name}
                  </Warn>{" "}
                  <Icon type="down" />
                </span>
              </Dropdown>
            ) : (
              <Link href="/login">
                <a>Login</a>
              </Link>
            )}
          </Col>
        </Row>
      </Header>
      <Content style={{ minHeight: "calc(100vh - 64px - 64px)" }}>
        {renderChildren({
          loading,
          currentUser: data && data.currentUser,
        })}
      </Content>
      <Footer>
        Copyright &copy; {new Date().getFullYear()} {companyName}. All rights
        reserved.
      </Footer>
    </Layout>
  );
}

export default SharedLayout;

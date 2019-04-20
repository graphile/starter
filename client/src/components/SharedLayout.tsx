import * as React from "react";
import { Layout, Row, Col, Dropdown, Icon, Menu } from "antd";
import Link from "next/link";
import { companyName } from "../../../server/src/config";
import {
  SharedLayoutQueryComponent,
  withLogoutMutation,
  LogoutMutationMutationFn,
} from "../graphql";
import Router from "next/router";
import { withApollo, compose, WithApolloClient } from "react-apollo";
import { useCallback } from "react";

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

interface SharedLayoutProps {
  title: string;
  children: any;
  noPad?: boolean;
}

const StandardWidth = ({ children }: { children: React.ReactNode }) => (
  <Row style={{ padding: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
    <Col>{children}</Col>
  </Row>
);

function SharedLayout({
  title,
  noPad = false,
  logout,
  client,
  children,
}: WithApolloClient<
  SharedLayoutProps & {
    logout: LogoutMutationMutationFn;
  }
>) {
  const handleLogout = useCallback(async () => {
    await logout();
    client.resetStore();
    Router.push("/");
  }, [client, logout]);
  return (
    <Layout>
      <Header>
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
            <SharedLayoutQueryComponent>
              {({ data }) =>
                data && data.currentUser ? (
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item>
                          <Link href="/settings">
                            <a>Settings</a>
                          </Link>
                        </Menu.Item>
                        <Menu.Item>
                          <a onClick={handleLogout}>Logout</a>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <span>
                      {data.currentUser.name} <Icon type="down" />
                    </span>
                  </Dropdown>
                ) : (
                  <Link href="/login">
                    <a>Login</a>
                  </Link>
                )
              }
            </SharedLayoutQueryComponent>
          </Col>
        </Row>
      </Header>
      <Content style={{ minHeight: "calc(100vh - 64px - 64px)" }}>
        {noPad ? children : <StandardWidth>{children}</StandardWidth>}
      </Content>
      <Footer>
        Copyright &copy; {new Date().getFullYear()} {companyName}. All rights
        reserved.
      </Footer>
    </Layout>
  );
}

export default compose(
  withLogoutMutation({ name: "logout" }),
  withApollo
)(SharedLayout);

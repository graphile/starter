import * as React from "react";
import Layout from "antd/lib/layout";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
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

export { Row, Col, Link };

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
                  <span>
                    {data.currentUser.name} <a onClick={handleLogout}>Logout</a>
                  </span>
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

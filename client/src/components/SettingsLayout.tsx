/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import React from "react";
import SharedLayout, {
  SharedLayoutChildProps,
} from "../components/SharedLayout";
import Link from "next/link";
import { Layout, Menu } from "antd";
import StandardWidth from "./StandardWidth";
import Warn from "./Warn";

const { Sider, Content } = Layout;

const pages = {
  "/settings": {
    title: "Profile",
  },
  "/settings/security": {
    title: "Password",
  },
  "/settings/accounts": {
    title: "Linked Accounts",
  },
  "/settings/emails": {
    title: "Emails",
    warnIfUnverified: true,
  },
};

interface SettingsLayoutProps {
  href: keyof typeof pages;
  children: React.ReactNode;
}

export default function SettingsLayout({
  href: inHref,
  children,
}: SettingsLayoutProps) {
  const href = pages[inHref] ? inHref : Object.keys(pages)[0];
  const page = pages[href];
  return (
    <SharedLayout title={`Settings: ${page.title}`} noPad>
      {({ currentUser }: SharedLayoutChildProps) => (
        <Layout style={{ minHeight: "calc(100vh - 64px - 64px)" }} hasSider>
          <Sider>
            <Menu selectedKeys={[href]}>
              {Object.keys(pages).map(href => (
                <Menu.Item key={href}>
                  <Link href={href}>
                    <a>
                      <Warn
                        okay={
                          !currentUser ||
                          currentUser.isVerified ||
                          !pages[href].warnIfUnverified
                        }
                      >
                        {pages[href].title}
                      </Warn>
                    </a>
                  </Link>
                </Menu.Item>
              ))}
            </Menu>
          </Sider>
          <Content>
            <StandardWidth>{children}</StandardWidth>
          </Content>
        </Layout>
      )}
    </SharedLayout>
  );
}

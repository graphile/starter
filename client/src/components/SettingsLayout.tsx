import React from "react";
import SharedLayout, {
  SharedLayoutChildProps,
} from "../components/SharedLayout";
import Link from "next/link";
import { Layout, Menu } from "antd";
import StandardWidth from "./StandardWidth";
import Warn from "./Warn";
import Redirect from "./Redirect";

const { Sider, Content } = Layout;

const pages = {
  "/settings": {
    title: "Profile",
    cy: "settingslayout-link-profile",
  },
  "/settings/security": {
    title: "Password",
    cy: "settingslayout-link-password",
  },
  "/settings/accounts": {
    title: "Linked Accounts",
    cy: "settingslayout-link-accounts",
  },
  "/settings/emails": {
    title: "Emails",
    warnIfUnverified: true,
    cy: "settingslayout-link-emails",
  },
  "/settings/delete": {
    title: "Delete Account",
    warnIfUnverified: true,
    cy: "settingslayout-link-delete",
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
      {({ currentUser, error, loading }: SharedLayoutChildProps) =>
        !currentUser && !error && !loading ? (
          <Redirect href={`/login?next=${encodeURIComponent(inHref)}`} />
        ) : (
          <Layout style={{ minHeight: "calc(100vh - 64px - 64px)" }} hasSider>
            <Sider>
              <Menu selectedKeys={[href]}>
                {Object.keys(pages).map(href => (
                  <Menu.Item key={href}>
                    <Link href={href}>
                      <a data-cy={pages[href].cy}>
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
        )
      }
    </SharedLayout>
  );
}

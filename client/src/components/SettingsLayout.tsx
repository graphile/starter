import React from "react";
import SharedLayout from "../components/SharedLayout";
import Link from "next/link";
import { Layout, Menu } from "antd";
import StandardWidth from "./StandardWidth";

const { Sider, Content } = Layout;

const pages = {
  "/settings": {
    title: "Profile",
  },
  "/settings/security": {
    title: "Password",
  },
  "/settings/emails": {
    title: "Emails",
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
      <Layout style={{ minHeight: "calc(100vh - 64px - 64px)" }} hasSider>
        <Sider>
          <Menu selectedKeys={[href]}>
            {Object.keys(pages).map(href => (
              <Menu.Item key={href}>
                <Link href={href}>
                  <a>{pages[href].title}</a>
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Content>
          <StandardWidth>{children}</StandardWidth>
        </Content>
      </Layout>
    </SharedLayout>
  );
}

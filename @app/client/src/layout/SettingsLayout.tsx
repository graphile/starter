import React from "react";
import SharedLayout, { SharedLayoutChildProps } from "./SharedLayout";
import Link from "next/link";
import { Layout, Menu, Typography } from "antd";
import { StandardWidth, Warn, Redirect } from "@app/components";
import { TextProps } from "antd/lib/typography/Text";
import { useRouter, NextRouter } from "next/router";
import * as qs from "querystring";

const { Text } = Typography;
const { Sider, Content } = Layout;

interface PageSpec {
  title: string;
  cy: string;
  warnIfUnverified?: boolean;
  titleProps?: TextProps;
}

// TypeScript shenanigans (so we can still use `keyof typeof pages` later)
function page(spec: PageSpec): PageSpec {
  return spec;
}

const pages = {
  "/settings": page({
    title: "Profile",
    cy: "settingslayout-link-profile",
  }),
  "/settings/security": page({
    title: "Password",
    cy: "settingslayout-link-password",
  }),
  "/settings/accounts": page({
    title: "Linked Accounts",
    cy: "settingslayout-link-accounts",
  }),
  "/settings/emails": page({
    title: "Emails",
    warnIfUnverified: true,
    cy: "settingslayout-link-emails",
  }),
  "/settings/delete": page({
    title: "Delete Account",
    titleProps: {
      type: "danger",
    },
    cy: "settingslayout-link-delete",
  }),
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
  // `useRouter()` sometimes returns null
  const router: NextRouter | null = useRouter();
  const fullHref =
    href + (router && router.query ? `?${qs.stringify(router.query)}` : "");
  return (
    <SharedLayout title={`Settings: ${page.title}`} noPad>
      {({ currentUser, error, loading }: SharedLayoutChildProps) =>
        !currentUser && !error && !loading ? (
          <Redirect href={`/login?next=${encodeURIComponent(fullHref)}`} />
        ) : (
          <Layout style={{ minHeight: "calc(100vh - 64px - 64px)" }} hasSider>
            <Sider>
              <Menu selectedKeys={[href]}>
                {Object.keys(pages).map(pageHref => (
                  <Menu.Item key={pageHref}>
                    <Link href={pageHref}>
                      <a data-cy={pages[pageHref].cy}>
                        <Warn
                          okay={
                            !currentUser ||
                            currentUser.isVerified ||
                            !pages[pageHref].warnIfUnverified
                          }
                        >
                          <Text {...pages[pageHref].titleProps}>
                            {pages[pageHref].title}
                          </Text>
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

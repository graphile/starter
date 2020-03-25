import { OrganizationPage_OrganizationFragment } from "@app/graphql";
import { Layout, Menu, Typography } from "antd";
import { TextProps } from "antd/lib/typography/Text";
import Link from "next/link";
import React, { useMemo } from "react";

import { contentMinHeight } from "./SharedLayout";
import { StandardWidth } from "./StandardWidth";

const { Text } = Typography;
const { Sider, Content } = Layout;

interface PageSpec {
  title: string;
  cy: string;
  titleProps?: TextProps;
}

// TypeScript shenanigans (so we can still use `keyof typeof pages` later)
function page(spec: PageSpec): PageSpec {
  return spec;
}

const makePages = (_org: OrganizationPage_OrganizationFragment) => ({
  [`/o/[slug]/settings`]: page({
    title: "Profile",
    cy: "orgsettingslayout-link-profile",
  }),
  [`/o/[slug]/settings/members`]: page({
    title: "Members",
    cy: "orgsettingslayout-link-members",
  }),
  [`/o/[slug]/settings/delete`]: page({
    title: "Delete Organization",
    titleProps: {
      type: "danger",
    },
    cy: "orgsettingslayout-link-delete",
  }),
});

export interface OrganizationSettingsLayoutProps {
  href: string;
  organization: OrganizationPage_OrganizationFragment;
  children: React.ReactNode;
}

export function OrganizationSettingsLayout({
  href: inHref,
  organization,
  children,
}: OrganizationSettingsLayoutProps) {
  const pages = useMemo(() => makePages(organization), [organization]);
  const href = pages[inHref] ? inHref : Object.keys(pages)[0];
  /*
  const page = pages[href];
  // `useRouter()` sometimes returns null
  const router: NextRouter | null = useRouter();
  const fullHref =
    href + (router && router.query ? `?${qs.stringify(router.query)}` : "");
    */
  return (
    <Layout style={{ minHeight: contentMinHeight }} hasSider>
      <Sider>
        <Menu selectedKeys={[href]}>
          {Object.keys(pages).map((pageHref) => (
            <Menu.Item key={pageHref}>
              <Link
                href={pageHref}
                as={pageHref.replace("[slug]", organization.slug)}
              >
                <a data-cy={pages[pageHref].cy}>
                  <Text {...pages[pageHref].titleProps}>
                    {pages[pageHref].title}
                  </Text>
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
  );
}

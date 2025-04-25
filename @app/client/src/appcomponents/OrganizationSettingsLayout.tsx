"use client";
import { OrganizationPage_OrganizationFragment } from "@/appgraphqlgenerated";
import { Layout, Menu, Typography } from "antd";
import { TextProps } from "antd/lib/typography/Text";
import Link from "next/link";
import React, { useMemo } from "react";

import { contentMinHeight } from "./SharedLayout";
import { StandardWidth } from "./StandardWidth";
import { usePathname } from "next/navigation";

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
  organization: OrganizationPage_OrganizationFragment;
  children: React.ReactNode;
}

export function OrganizationSettingsLayout({
  organization,
  children,
}: OrganizationSettingsLayoutProps) {
  const pathname = usePathname();
  const pages = useMemo(() => makePages(organization), [organization]);

  // Use provided href or try to match the current pathname to a route pattern
  const href =
    Object.keys(pages).find(route => {
      // Convert route pattern to regex
      const routeRegex = new RegExp(
        `^${route.replace('[slug]', organization.slug).replace(/\[.*?\]/g, '[^/]+')}$`
      );
      return routeRegex.test(pathname || '');
    }) ||
    Object.keys(pages)[0]; // Fallback to first page

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
          {(Object.keys(pages) as (keyof typeof pages)[]).map((pageHref) => (
            <Menu.Item key={pageHref}>
              <Link
                href={pageHref}
                data-cy={pages[pageHref].cy}
                as={pageHref.replace("[slug]", organization.slug)}
              >
                <Text {...pages[pageHref].titleProps}>
                  {pages[pageHref].title}
                </Text>
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

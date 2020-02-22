import React, { useMemo } from "react";
import Link from "next/link";
import { Layout, Menu, Typography } from "antd";
import { StandardWidth } from "@app/components";
import { TextProps } from "antd/lib/typography/Text";
import { OrganizationPageOrganizationFragment } from "@app/graphql";

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

const makePages = (org: OrganizationPageOrganizationFragment) => ({
  [`/o/${org.slug}/settings`]: page({
    title: "Profile",
    cy: "orgsettingslayout-link-profile",
  }),
  [`/o/${org.slug}/settings/members`]: page({
    title: "Members",
    cy: "orgsettingslayout-link-members",
  }),
  [`/o/${org.slug}/settings/delete`]: page({
    title: "Delete Organization",
    titleProps: {
      type: "danger",
    },
    cy: "orgsettingslayout-link-delete",
  }),
});

interface OrganizationSettingsLayoutProps {
  href: string;
  organization: OrganizationPageOrganizationFragment;
  children: React.ReactNode;
}

export default function OrganizationSettingsLayout({
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
    <Layout style={{ minHeight: "calc(100vh - 64px - 64px)" }} hasSider>
      <Sider>
        <Menu selectedKeys={[href]}>
          {Object.keys(pages).map(pageHref => (
            <Menu.Item key={pageHref}>
              <Link href={pageHref}>
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

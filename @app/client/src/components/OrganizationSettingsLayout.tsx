import { useOrganizationLoading } from "@app/client/src/components/organizationHooks";
import type {
  Maybe,
  OrganizationMembersQueryResult,
  OrganizationPage_OrganizationFragment,
  OrganizationPageQueryResult,
} from "@app/graphql";
import { Button, Navbar, Text, TextProps } from "@mantine/core";
import React, { useMemo } from "react";

import {
  AuthRestrict,
  SharedLayout,
  SharedLayoutChildProps,
} from "./SharedLayout";

interface PageSpec {
  title: string;
  cy: string;
  titleProps?: TextProps<any>;
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
  title?: string;
  titleHref?: string;
  query: OrganizationPageQueryResult | OrganizationMembersQueryResult;
  href: string;
  organization: Maybe<OrganizationPage_OrganizationFragment>;
  children:
    | React.ReactNode
    | ((props: SharedLayoutChildProps) => React.ReactNode);
}

export function OrganizationSettingsLayout({
  title,
  titleHref,
  // TODO mc 2022-01-31: replace with a value from pageContext
  href: inHref,
  query,
  organization,
  children,
}: OrganizationSettingsLayoutProps) {
  const { loading } = query;
  const organizationLoadingElement = useOrganizationLoading(query);
  const pages = useMemo(
    () => (organization ? makePages(organization) : []),
    [organization]
  );

  const render =
    !loading && organization ? (
      <Navbar width={{ base: 300 }} height={500} padding="xs">
        {Object.keys(pages).map((pageHref) => {
          const href = pageHref.replace("[slug]", organization.slug);
          return (
            <Button
              component={"a"}
              key={href}
              variant={href === inHref ? "filled" : "subtle"}
              href={href}
              data-cy={pages[pageHref].cy}
              fullWidth
              className={href === inHref ? "is-active" : ""}
            >
              <Text {...pages[pageHref].titleProps}>
                {pages[pageHref].title}
              </Text>
            </Button>
          );
        })}
      </Navbar>
    ) : null;
  return (
    <SharedLayout
      query={query}
      title={title}
      titleHref={titleHref}
      navbar={loading ? null : render}
      forbidWhen={AuthRestrict.LOGGED_OUT}
      // eslint-disable-next-line react/no-children-prop
      children={organizationLoadingElement || children}
    />
    // {/*{organizationLoadingElement || <StandardWidth>{children}</StandardWidth>}*/}
    // </SharedLayout>
  );
}

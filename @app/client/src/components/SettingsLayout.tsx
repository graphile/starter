import { Redirect } from "@app/client/src/components/Redirect";
import { Button, Navbar, Text, TextProps } from "@mantine/core";
import React from "react";

import {
  AuthRestrict,
  SharedLayout,
  SharedLayoutChildProps,
  SharedLayoutProps,
} from "./SharedLayout";
import { StandardWidth } from "./StandardWidth";
import { Warn } from "./Warn";

interface PageSpec {
  title: string;
  cy: string;
  warnIfUnverified?: boolean;
  titleProps?: TextProps<any>;
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
    title: "Passphrase",
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

export interface SettingsLayoutProps {
  query: SharedLayoutProps["query"];
  href: keyof typeof pages;
  children: React.ReactNode;
}

export function SettingsLayout({
  href: inHref,
  query,
  children,
}: SettingsLayoutProps) {
  const href = pages[inHref] ? inHref : Object.keys(pages)[0];
  const page = pages[href];

  // TODO mc-2022-01-31: get this working
  // const fullHref =
  //   href + (router && router.query ? `?${qs.stringify(router.query)}` : "");

  const renderNavbar = ({ currentUser }: SharedLayoutChildProps) => (
    <Navbar width={{ base: 300 }} height={500} padding="xs">
      {Object.keys(pages).map((pageHref) => (
        <Button
          component={"a"}
          variant={pageHref === inHref ? "filled" : "subtle"}
          key={pageHref}
          href={pageHref}
          data-cy={pages[pageHref].cy}
          fullWidth
          className={pageHref === inHref ? "is-active" : ""}
        >
          <Warn
            okay={
              !currentUser ||
              currentUser.isVerified ||
              !pages[pageHref].warnIfUnverified
            }
          >
            <Text {...pages[pageHref].titleProps}>{pages[pageHref].title}</Text>
          </Warn>
        </Button>
      ))}
    </Navbar>
  );

  return (
    <SharedLayout
      query={query}
      title={`Settings: ${page.title}`}
      noPad
      forbidWhen={AuthRestrict.LOGGED_OUT}
      navbar={renderNavbar}
    >
      {({ currentUser, error, loading }) =>
        !currentUser && !error && !loading ? (
          <Redirect href={`/login?next=${encodeURIComponent(href)}`} />
        ) : (
          <StandardWidth>{children}</StandardWidth>
        )
      }
    </SharedLayout>
  );
}

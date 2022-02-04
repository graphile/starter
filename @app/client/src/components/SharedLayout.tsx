import { ApolloError, QueryResult } from "@apollo/client";
import type {
  SharedLayout_QueryFragment,
  SharedLayout_UserFragment,
} from "@app/graphql";
import { useCurrentUserUpdatedSubscription } from "@app/graphql";
import { AppShell } from "@mantine/core";
import React from "react";

import { usePageContext } from "../renderer/usePageContext";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader";
import { ErrorAlert, StandardWidth } from "./index";
import { Redirect } from "./Redirect";

export const contentMinHeight = "calc(100vh - 64px - 70px)";

export interface SharedLayoutChildProps {
  error?: ApolloError | Error;
  loading: boolean;
  currentUser?: SharedLayout_UserFragment | null;
}

export enum AuthRestrict {
  NEVER = 0,
  LOGGED_OUT = 1 << 0,
  LOGGED_IN = 1 << 1,
  NOT_ADMIN = 1 << 2,
}

export interface SharedLayoutProps {
  /*
   * We're expecting lots of different queries to be passed through here, and
   * for them to have this common required data we need. Methods like
   * `subscribeToMore` are too specific (and we don't need them) so we're going
   * to drop them from the data requirements.
   *
   * NOTE: we're not fetching this query internally because we want the entire
   * page to be fetchable via a single GraphQL query, rather than multiple
   * chained queries.
   */
  query: Pick<
    QueryResult<SharedLayout_QueryFragment>,
    "data" | "loading" | "error" | "networkStatus" | "client" | "refetch"
  >;

  title?: string;
  titleHref?: string;
  navbar?:
    | React.ReactNode
    | ((props: SharedLayoutChildProps) => React.ReactNode);
  children:
    | React.ReactNode
    | ((props: SharedLayoutChildProps) => React.ReactNode);
  noPad?: boolean;
  noHandleErrors?: boolean;
  forbidWhen?: AuthRestrict;
}

/* The Apollo `useSubscription` hook doesn't currently allow skipping the
 * subscription; we only want it when the user is logged in, so we conditionally
 * call this stub component.
 */
function CurrentUserUpdatedSubscription() {
  /*
   * This will set up a GraphQL subscription monitoring for changes to the
   * current user. Interestingly we don't need to actually _do_ anything - no
   * rendering or similar - because the payload of this mutation will
   * automatically update Apollo's cache which will cause the data to be
   * re-rendered wherever appropriate.
   */
  useCurrentUserUpdatedSubscription();
  return null;
}

export function SharedLayout({
  title,
  titleHref,
  noPad = false,
  noHandleErrors = false,
  query,
  forbidWhen = AuthRestrict.NEVER,
  navbar,
  children,
}: SharedLayoutProps) {
  const { urlPathname: currentUrl } = usePageContext();

  const forbidsLoggedIn = forbidWhen & AuthRestrict.LOGGED_IN;
  const forbidsLoggedOut = forbidWhen & AuthRestrict.LOGGED_OUT;
  const forbidsNotAdmin = forbidWhen & AuthRestrict.NOT_ADMIN;
  const renderNavbar = (props: SharedLayoutChildProps) => {
    const inner =
      props.error && !props.loading && !noHandleErrors ? (
        <>
          {import.meta.env.NODE_ENV === "development" ? (
            <ErrorAlert error={props.error} />
          ) : null}
        </>
      ) : typeof navbar === "function" ? (
        navbar(props)
      ) : (
        navbar
      );
    if (
      data &&
      data.currentUser &&
      (forbidsLoggedIn || (forbidsNotAdmin && !data.currentUser.isAdmin))
    ) {
      return <Redirect href={"/"} />;
    } else if (
      data &&
      data.currentUser === null &&
      !loading &&
      !error &&
      forbidsLoggedOut
    ) {
      return (
        <Redirect href={`/login?next=${encodeURIComponent(currentUrl)}`} />
      );
    }

    return inner;
  };

  const renderChildren = (props: SharedLayoutChildProps) => {
    const inner =
      props.error && !props.loading && !noHandleErrors ? (
        <>
          {import.meta.env.NODE_ENV === "development" ? (
            <ErrorAlert error={props.error} />
          ) : null}
        </>
      ) : typeof children === "function" ? (
        children(props)
      ) : (
        children
      );
    if (
      data &&
      data.currentUser &&
      (forbidsLoggedIn || (forbidsNotAdmin && !data.currentUser.isAdmin))
    ) {
      return (
        <StandardWidth>
          <Redirect href={"/"} />
        </StandardWidth>
      );
    } else if (
      data &&
      data.currentUser === null &&
      !loading &&
      !error &&
      forbidsLoggedOut
    ) {
      return (
        <Redirect href={`/login?next=${encodeURIComponent(currentUrl)}`} />
      );
    }

    return noPad ? inner : <StandardWidth>{inner}</StandardWidth>;
  };
  const { data, loading, error } = query;

  return (
    <AppShell
      navbar={renderNavbar({
        error,
        loading,
        currentUser: data && data.currentUser,
      })}
      header={<AppHeader title={title} titleHref={titleHref} query={query} />}
    >
      {data && data.currentUser ? <CurrentUserUpdatedSubscription /> : null}
      <div style={{ minHeight: contentMinHeight }}>
        {renderChildren({
          error,
          loading,
          currentUser: data && data.currentUser,
        })}
      </div>
      <AppFooter />
    </AppShell>
  );
}

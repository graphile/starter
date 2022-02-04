import { QueryResult } from "@apollo/client";
import { usePageContext } from "@app/client/src/renderer/usePageContext";
import type { OrganizationPage_QueryFragment } from "@app/graphql";
import { Box, Group } from "@mantine/core";
import React from "react";

import { ErrorAlert, FourOhFour } from "./";
import { SpinPadded } from "./SpinPadded";

// usePageContext
export function useOrganizationSlug() {
  const pageContext = usePageContext();
  const {
    routeParams: { slug: rawSlug },
  } = pageContext as typeof pageContext & { routeParams: { slug: string } };
  return String(rawSlug);
}

export function useOrganizationLoading(
  query: Pick<
    QueryResult<OrganizationPage_QueryFragment>,
    "data" | "loading" | "error" | "networkStatus" | "client" | "refetch"
  >
) {
  const { data, loading, error } = query;

  let child: JSX.Element | null = null;
  const organization = data?.organizationBySlug;
  if (organization) {
    //child = <OrganizationPageInner organization={organization} />;
  } else if (loading) {
    child = <SpinPadded />;
  } else if (error) {
    child = <ErrorAlert error={error} />;
  } else {
    child = <FourOhFour currentUser={data?.currentUser} />;
  }

  return child ? (
    <Group>
      <Box style={{ flex: 1 }}>{child}</Box>
    </Group>
  ) : null;
}

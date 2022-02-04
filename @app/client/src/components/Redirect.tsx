import { useApolloClient } from "@apollo/client";
import { Skeleton } from "@mantine/core";
import React, { useEffect } from "react";
import { navigate } from "vite-plugin-ssr/client/router";

import { H3, StandardWidth } from "./index";
import { SharedLayout } from "./SharedLayout";

export interface RedirectProps {
  href: string;
  layout?: boolean;
}

export function Redirect({ href, layout }: RedirectProps) {
  const client = useApolloClient();
  useEffect(() => {
    navigate(href);
  }, [href]);
  if (layout) {
    return (
      <SharedLayout
        title="Redirecting..."
        query={{
          loading: true,
          data: undefined,
          error: undefined,
          networkStatus: 0,
          client,
          refetch: (async () => {
            throw new Error("Redirecting...");
          }) as any,
        }}
      >
        <Skeleton />
      </SharedLayout>
    );
  } else {
    return (
      <StandardWidth>
        <H3>Redirecting...</H3>
        <Skeleton />
      </StandardWidth>
    );
  }
}

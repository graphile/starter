import { useApolloClient } from "@apollo/react-hooks";
import { Skeleton } from "antd";
import Router from "next/router";
import React, { useEffect } from "react";

import { SharedLayout } from "./SharedLayout";

export interface RedirectProps {
  href: string;
  as?: string;
}

export function Redirect({ href, as }: RedirectProps) {
  const client = useApolloClient();
  useEffect(() => {
    Router.push(href, as);
  }, [as, href]);
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
}

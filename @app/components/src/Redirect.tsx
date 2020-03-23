import { useApolloClient } from "@apollo/react-hooks";
import { Skeleton } from "antd";
import Router from "next/router";
import React, { useEffect } from "react";

import { SharedLayout } from "./SharedLayout";

export interface RedirectProps {
  href: string;
}

export function Redirect({ href }: RedirectProps) {
  const client = useApolloClient();
  useEffect(() => {
    Router.push(href);
  }, [href]);
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

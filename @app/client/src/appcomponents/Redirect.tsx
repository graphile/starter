"use client";
import { NetworkStatus, useApolloClient } from "@apollo/client";
import { Skeleton } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { SharedLayout } from "./SharedLayout";
import { StandardWidth } from "./StandardWidth";
import { H3 } from "./Text";

export interface RedirectProps {
  href: string;
  as?: string;
  layout?: boolean;
}

export function Redirect({ href, layout }: RedirectProps) {
  const client = useApolloClient();
  const router = useRouter();
  useEffect(() => {
    router.push(href);
  }, [router, href]);
  if (layout) {
    return (
      <SharedLayout
        title="Redirecting..."
        query={{
          loading: true,
          data: undefined,
          error: undefined,
          networkStatus: NetworkStatus.loading,
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

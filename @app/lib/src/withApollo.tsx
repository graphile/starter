import { getDataFromTree } from "@apollo/react-ssr";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink, split } from "apollo-link";
import { onError } from "apollo-link-error";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getOperationAST } from "graphql";
import withApolloBase, { InitApolloOptions } from "next-with-apollo";
import React from "react";
import { SubscriptionClient } from "subscriptions-transport-ws";
import ws from "ws";

import { GraphileApolloLink } from "./GraphileApolloLink";

interface WithApolloOptions {
  useNext?: boolean;
  rootUrl?: string;
}

let wsClient: SubscriptionClient | null = null;

export function resetWebsocketConnection(): void {
  if (wsClient) {
    wsClient.close(false, false);
  }
}

function makeServerSideLink(req: any, res: any) {
  return new GraphileApolloLink({
    req,
    res,
    postgraphileMiddleware: req.app.get("postgraphileMiddleware"),
  });
}

function makeClientSideLink(ROOT_URL: string) {
  const nextDataEl =
    typeof document !== "undefined" && document.getElementById("__NEXT_DATA__");
  const headers = {};
  if (nextDataEl && nextDataEl.textContent) {
    const data = JSON.parse(nextDataEl.textContent);
    headers["CSRF-Token"] = data.query.CSRF_TOKEN;
  }
  const httpLink = new HttpLink({
    uri: `${ROOT_URL}/graphql`,
    credentials:
      process.env.NODE_ENV === "development" ? "include" : "same-origin",
    headers,
  });
  wsClient = new SubscriptionClient(
    `${ROOT_URL.replace(/^http/, "ws")}/graphql`,
    {
      reconnect: true,
    },
    typeof WebSocket !== "undefined" ? WebSocket : ws
  );
  const wsLink = new WebSocketLink(wsClient);

  // Using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent.
  const mainLink = split(
    // split based on operation type
    ({ query, operationName }) => {
      const op = getOperationAST(query, operationName);
      return (op && op.operation === "subscription") || false;
    },
    wsLink,
    httpLink
  );
  return mainLink;
}

const getApolloClient = (
  { initialState, ctx }: InitApolloOptions<NormalizedCacheObject>,
  withApolloOptions?: WithApolloOptions
): ApolloClient<NormalizedCacheObject> => {
  const ROOT_URL = process.env.ROOT_URL || withApolloOptions?.rootUrl;
  if (!ROOT_URL) {
    throw new Error("ROOT_URL envvar is not set");
  }

  const onErrorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: message: ${message}, location: ${JSON.stringify(
            locations
          )}, path: ${JSON.stringify(path)}`
        )
      );
    if (networkError) console.error(`[Network error]: ${networkError}`);
  });

  const { req, res }: any = ctx || {};
  const isServer = typeof window === "undefined";
  const mainLink =
    isServer && req && res
      ? makeServerSideLink(req, res)
      : makeClientSideLink(ROOT_URL);

  const client = new ApolloClient({
    link: ApolloLink.from([onErrorLink, mainLink]),
    cache: new InMemoryCache({
      dataIdFromObject: (o) =>
        o.__typename === "Query"
          ? "ROOT_QUERY"
          : o.id
          ? `${o.__typename}:${o.id}`
          : null,
    }).restore(initialState || {}),
  });

  return client;
};

const withApolloWithNext = withApolloBase(getApolloClient, {
  getDataFromTree,
});

const withApolloWithoutNext = (Component: any, options?: WithApolloOptions) => (
  props: any
) => {
  const apollo = getApolloClient({}, options);
  return <Component {...props} apollo={apollo} />;
};

export const withApollo = (Component: any, options?: WithApolloOptions) =>
  options?.useNext === false
    ? withApolloWithoutNext(Component, options)
    : withApolloWithNext(Component);

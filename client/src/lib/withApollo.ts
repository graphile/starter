/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import withApollo from "next-with-apollo";
import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { onError } from "apollo-link-error";
import ws from "ws";
import { pick } from "lodash";

export default withApollo(
  ({ headers, initialState }) => {
    const isServer = typeof window === "undefined";
    const onErrorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    });

    const httpLink = new HttpLink({
      uri: `${process.env.ROOT_URL}/graphql`,
      credentials: "same-origin",
      ...(isServer
        ? { headers: pick(headers, "user-agent", "dnt", "cookie") }
        : null),
    });

    const wsLink = new WebSocketLink({
      uri: `${process.env.ROOT_URL!.replace(/^http/, "ws")}/graphql`,
      options: {
        reconnect: true,
      },
      webSocketImpl: typeof WebSocket !== "undefined" ? WebSocket : ws,
    });

    // Using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent.
    const mainLink = split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    );
    const client = new ApolloClient({
      link: ApolloLink.from([onErrorLink, mainLink]),
      cache: new InMemoryCache().restore(initialState || {}),
    });
    return client;
  },
  {
    getDataFromTree: "ssr",
  }
);

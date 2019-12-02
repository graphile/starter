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
import GraphileLink from "./GraphileLink";

export default withApollo(
  ({ headers, initialState, ctx }) => {
    const ROOT_URL = process.env.ROOT_URL;
    if (!ROOT_URL) {
      throw new Error("ROOT_URL envvar is not set");
    }
    const isServer = typeof window === "undefined";
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
    const httpLink =
      req && res
        ? new GraphileLink({
            req,
            res,
            postgraphileMiddleware: req.app.get("postgraphileMiddleware"),
          })
        : new HttpLink({
            uri: `${ROOT_URL}/graphql`,
            credentials: "same-origin",
            ...(isServer
              ? { headers: pick(headers, "user-agent", "dnt", "cookie") }
              : null),
          });
    const wsLink = new WebSocketLink({
      uri: `${ROOT_URL.replace(/^http/, "ws")}/graphql`,
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

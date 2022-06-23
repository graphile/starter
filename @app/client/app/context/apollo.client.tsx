import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getOperationAST } from "graphql";
import type { Client } from "graphql-ws";
import { createClient } from "graphql-ws";

// Adapted from graphile starter `withApollo`

let wsClient: Client | null = null;
let _rootURL: string | null = null;

function createWsClient() {
  if (!_rootURL) {
    throw new Error("No ROOT_URL");
  }
  const url = `${_rootURL.replace(/^http/, "ws")}/graphql`;
  return createClient({
    url,
  });
}

export function resetWebsocketConnection(): void {
  if (wsClient) {
    wsClient.dispose();
  }
  wsClient = createWsClient();
}

function makeClientSideLink() {
  const ROOT_URL = window.ENV.ROOT_URL;
  const CSRF_TOKEN = window.ENV.CSRF_TOKEN;
  if (_rootURL) {
    throw new Error("Must only makeClientSideLink once");
  }
  _rootURL = ROOT_URL;
  const httpLink = new HttpLink({
    uri: `${ROOT_URL}/graphql`,
    credentials: "same-origin",
    headers: {
      "CSRF-Token": CSRF_TOKEN,
    },
  });
  if (!wsClient) {
    wsClient = createWsClient();
  }
  const wsLink = new GraphQLWsLink(wsClient);

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

export function initApollo() {
  if (!window) {
    throw new Error("Cannot be run in server rendering");
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

  const mainLink = makeClientSideLink();
  const client = new ApolloClient({
    link: ApolloLink.from([onErrorLink, mainLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          queryType: true,
        },
      },
    }),
  });

  return client;
}

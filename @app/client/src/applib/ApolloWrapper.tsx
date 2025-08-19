"use client";
// ^ this file needs the "use client" pragma

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

// have a function to create a client for you
function makeClient() {
  const ROOT_URL = process.env.ROOT_URL;
  if (!ROOT_URL) {
    throw new Error("ROOT_URL envvar is not set");
  }

  // const nextDataEl = document.getElementById("__NEXT_DATA__");
  // if (!nextDataEl || !nextDataEl.textContent) {
  //   throw new Error("Cannot read from __NEXT_DATA__ element");
  // }
  // const data = JSON.parse(nextDataEl.textContent);
  // const CSRF_TOKEN = data.query.CSRF_TOKEN;
  //
  // if (!CSRF_TOKEN) {
  //   throw new Error("CSRF_TOKEN is not set");
  // }

  // TODO: use GraphileApolloLink
  const httpLink = new HttpLink({
    // this needs to be an absolute url, as relative urls cannot be used in SSR
    // uri: `${ROOT_URL}/api/graphql`,
    uri: `${ROOT_URL}/graphql`,
    credentials: "same-origin",
    headers: {
      // "CSRF-Token": CSRF_TOKEN,
    },

    // you can disable result caching here if you want to
    // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
    fetchOptions: {
      // you can pass additional options that should be passed to `fetch` here,
      // e.g. Next.js-related `fetch` options regarding caching and revalidation
      // see https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
    },
    // you can override the default `fetchOptions` on a per query basis
    // via the `context` property on the options passed as a second argument
    // to an Apollo Client data fetching hook, e.g.:
    // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { ... }}});
  });

  // use the `ApolloClient` from "@apollo/client-integration-nextjs"
  return new ApolloClient({
    // use the `InMemoryCache` from "@apollo/client-integration-nextjs"
    cache: new InMemoryCache(),
    link: httpLink,
  });
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}

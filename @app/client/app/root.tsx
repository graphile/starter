import type { ApolloClient } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import { CurrentUserUpdatedDocument } from "@app/graphql";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "@remix-run/react";
import nprogressStyles from "nprogress/nprogress.css";
import { useState } from "react";
import { AuthenticityTokenProvider, useHydrated } from "remix-utils";

import { SubscriptionReload } from "~/components";
import { initApollo, resetWebsocketConnection } from "~/context/apollo.client";

import compiledStyles from "./css/main.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export type BROWSER_ENV = {
  ROOT_URL: string;
  T_AND_C_URL: string;
  CSRF_TOKEN: string;
};

export async function loader({ context }: LoaderArgs) {
  const { cspNonce, graphqlSdk, csrfToken } = context;
  const sdk = await graphqlSdk;
  const data = await sdk.Shared();
  const user = data.currentUser;
  const ENV: BROWSER_ENV = {
    ROOT_URL: process.env.ROOT_URL!,
    T_AND_C_URL: process.env.T_AND_C_URL!,
    CSRF_TOKEN: csrfToken,
  };
  return json({
    user,
    cspNonce,
    csrfToken,
    ENV,
  });
}

export function links() {
  return [
    {
      rel: "stylesheet",
      href: compiledStyles,
    },
    {
      rel: "stylesheet",
      href: nprogressStyles,
    },
  ];
}

export default function App() {
  const [client, setClient] = useState<ApolloClient<any> | undefined>();
  const loaderData = useLoaderData<typeof loader>();
  let { cspNonce } = loaderData;
  const { csrfToken, ENV, user } = loaderData;
  const [userId, setUserId] = useState<string | undefined>(user?.id);

  // Don't update nonce when rendering on the client - it is stripped from the
  // DOM as soon as the page loads per spec. See
  // https://html.spec.whatwg.org/multipage/urls-and-fetching.html#nonce-attributes
  if (typeof document !== "undefined") {
    cspNonce = "";
  }

  const hydrated = useHydrated();
  let outlet = <Outlet />;
  if (hydrated) {
    // Reset websocket connection when current user changes
    if (user?.id !== userId) {
      resetWebsocketConnection();
      setUserId(user?.id);
    }
    if (!client) {
      setClient(initApollo());
    }
    if (client) {
      outlet = (
        <ApolloProvider client={client}>
          {user?.id && (
            <SubscriptionReload query={CurrentUserUpdatedDocument} />
          )}
          <Outlet />
        </ApolloProvider>
      );
    }
  }
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <AuthenticityTokenProvider token={csrfToken}>
          {outlet}
        </AuthenticityTokenProvider>
        <script
          nonce={cspNonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <ScrollRestoration nonce={cspNonce} />
        <Scripts nonce={cspNonce} />
        <LiveReload nonce={cspNonce} />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: any) {
  // const { cspNonce } = useLoaderDataTyped<typeof loader>();
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div>An error occurred</div>
        {/* <Scripts nonce={cspNonce} /> */}
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  console.log(caught);
  if (caught.status === 422) {
    return (
      <html>
        <head>
          <title>Oh no!</title>
          <Meta />
          <Links />
        </head>
        <body>
          <div>Your session has expired - please reload the application.</div>
          {/* <Scripts nonce={cspNonce} /> */}
        </body>
      </html>
    );
  }
  // const { cspNonce } = useLoaderDataTyped<typeof loader>();
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          ERROR: {caught.statusText} {caught.status}
        </div>
        <div>{caught.data?.message}</div>
        {/* <Scripts nonce={cspNonce} /> */}
      </body>
    </html>
  );
}

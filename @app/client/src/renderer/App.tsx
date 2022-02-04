import { ApolloClient, ApolloProvider } from "@apollo/client";
import { MantineProvider, TypographyStylesProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import React from "react";
import { FilledContext, Helmet, HelmetProvider } from "react-helmet-async";

import logoUrl from "./logo.svg";
import { PageContext } from "./types";
import { PageContextProvider } from "./usePageContext";

export { App };

function App({
  children,
  pageContext,
  apolloClient,
  helmetContext,
}: {
  children: React.ReactNode;
  pageContext: PageContext;
  apolloClient: ApolloClient<any>;
  helmetContext: FilledContext;
}) {
  return (
    <HelmetProvider context={helmetContext}>
      <Helmet>
        <meta charSet="UTF-8" />
        <link rel="icon" href={logoUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite SSR app</title>
      </Helmet>
      <MantineProvider
        withNormalizeCSS
        withGlobalStyles
        theme={{ colorScheme: "dark" }}
      >
        <NotificationsProvider>
          <ApolloProvider client={apolloClient}>
            <PageContextProvider pageContext={pageContext}>
              <TypographyStylesProvider>{children}</TypographyStylesProvider>
            </PageContextProvider>
          </ApolloProvider>
        </NotificationsProvider>
      </MantineProvider>
    </HelmetProvider>
  );
}

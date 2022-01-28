import { ApolloProvider } from "@apollo/client";
import { getDataFromTree } from "@apollo/client/react/ssr";
import { createStylesServer, ServerStyles } from "@mantine/ssr";
import React from "react";
import ReactDOMServer, { renderToString } from "react-dom/server";
import { FilledContext, Helmet, HelmetProvider } from "react-helmet-async";
import type { PageContextBuiltIn } from "vite-plugin-ssr";
import { dangerouslySkipEscape, escapeInject } from "vite-plugin-ssr";

import logoUrl from "./logo.svg";
import { PageShell } from "./PageShell";
import type { PageContext } from "./types";

export { render };
export { onBeforeRender };
// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = [
  "apolloInitialState",
  "csrfToken",
  "documentProps",
  "helmetContext",
  "pageProps",
  "ROOT_URL",
  "routeParams",
  "urlPathname",
];

const stylesServer = createStylesServer();

async function render(pageContext: PageContextBuiltIn & PageContext) {
  const helmetContext: any = {};
  const { Page, pageProps, apolloClient, renderedStyles } = pageContext;
  const pageHtml = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <Helmet>
        <meta charSet="UTF-8" />
        <link rel="icon" href={logoUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite SSR app</title>
      </Helmet>
      <ApolloProvider client={apolloClient}>
        <PageShell pageContext={pageContext}>
          <Page {...pageProps} />
        </PageShell>
      </ApolloProvider>
    </HelmetProvider>
  );
  const { helmet } = helmetContext as FilledContext;

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en" ${dangerouslySkipEscape(helmet.htmlAttributes.toString())}>
      <head>
        ${dangerouslySkipEscape(helmet.title.toString())}
        ${dangerouslySkipEscape(helmet.meta.toString())}
        ${dangerouslySkipEscape(helmet.link.toString())}
        ${dangerouslySkipEscape(renderedStyles)}
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
    },
  };
}

// TODO mc 2022-01-28: this seems redundant with render() above
async function onBeforeRender(pageContext: PageContext) {
  const { Page, apolloClient } = pageContext;
  const helmetContext: any = pageContext?.helmetContext || {};

  const tree = (
    <HelmetProvider context={helmetContext}>
      <ApolloProvider client={apolloClient}>
        <Page />
      </ApolloProvider>
    </HelmetProvider>
  );
  // TODO mc 2022-01-28: review add'l logic in next-with-apollo source
  // https://github.com/lfades/next-with-apollo/blob/master/src/withApollo.tsx#L73
  const pageHtml = await getDataFromTree(tree);
  const renderedStyles = renderToString(
    <ServerStyles html={pageHtml} server={stylesServer} />
  );

  const apolloInitialState = apolloClient.extract();
  return {
    pageContext: {
      pageHtml,
      apolloInitialState,
      renderedStyles,
    },
  };
}

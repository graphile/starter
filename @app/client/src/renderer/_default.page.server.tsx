import logoUrl from "./logo.svg";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { FilledContext, Helmet, HelmetProvider } from "react-helmet-async";
import type { PageContextBuiltIn } from "vite-plugin-ssr";
import { dangerouslySkipEscape, escapeInject } from "vite-plugin-ssr";

import { PageShell } from "./PageShell";
import type { PageContext } from "./types";

export { render };
// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = [
  "pageProps",
  "helmetContext",
  "documentProps",
  "urlPathname",
  "routeParams",
];

async function render(pageContext: PageContextBuiltIn & PageContext) {
  const helmetContext: any = {};
  const { Page, pageProps } = pageContext;
  const pageHtml = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <Helmet>
        <meta charSet="UTF-8" />
        <link rel="icon" href={logoUrl} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite SSR app</title>
      </Helmet>
      <PageShell pageContext={pageContext}>
        <Page {...pageProps} />
      </PageShell>
    </HelmetProvider>
  );
  const { helmet } = helmetContext as FilledContext;

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en" ${dangerouslySkipEscape(helmet.htmlAttributes.toString())}>
      <head>
        ${dangerouslySkipEscape(helmet.title.toString())}
        ${dangerouslySkipEscape(helmet.meta.toString())}
        ${dangerouslySkipEscape(helmet.link.toString())}
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

import "nprogress/nprogress.css";

import { ApolloClient, ApolloProvider } from "@apollo/client";
import { MantineProvider } from "@mantine/core";
import * as NProgress from "nprogress";
import React from "react";
import ReactDOM from "react-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import type { PageContextBuiltInClient } from "vite-plugin-ssr/client/router";
import { useClientRouter } from "vite-plugin-ssr/client/router";

import { makeApolloClient } from "./makeApolloClient";
import type { PageContext } from "./types";
import { App } from "./App";

let apolloClient: ApolloClient<any>;

// eslint-disable-next-line react-hooks/rules-of-hooks
const { hydrationPromise } = useClientRouter({
  render(pageContext: PageContextBuiltInClient & PageContext) {
    const { Page, pageProps, helmetContext, apolloInitialState } = pageContext;

    // Only create a single instance when using Client Routing.
    if (!apolloClient) {
      apolloClient = makeApolloClient({
        initialState: apolloInitialState,
        ROOT_URL: pageContext.ROOT_URL,
      });
    }

    const page = (
      <App
        pageContext={pageContext}
        apolloClient={apolloClient}
        helmetContext={helmetContext}
      >
        <Page {...pageProps} />
      </App>
    );
    const container = document.getElementById("page-view");
    if (pageContext.isHydration) {
      ReactDOM.hydrate(page, container);
    } else {
      ReactDOM.render(page, container);
    }
  },
  onTransitionStart,
  onTransitionEnd,
});

hydrationPromise.then(() => {
  console.log("Hydration finished; page is now interactive.");
});

function onTransitionStart() {
  console.log("Page transition start");
  document.querySelector("#page-view")!.classList.add("page-transition");
  NProgress.start();
}
function onTransitionEnd() {
  console.log("Page transition end");
  document.querySelector("#page-view")!.classList.remove("page-transition");
  NProgress.done();
}

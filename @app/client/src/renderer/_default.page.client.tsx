import React from "react";
import ReactDOM from "react-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import type { PageContextBuiltInClient } from "vite-plugin-ssr/client/router";
import { useClientRouter } from "vite-plugin-ssr/client/router";

import { PageShell } from "./PageShell";
import type { PageContext } from "./types";

// eslint-disable-next-line react-hooks/rules-of-hooks
const { hydrationPromise } = useClientRouter({
  render(pageContext: PageContextBuiltInClient & PageContext) {
    const { Page, pageProps, helmetContext } = pageContext;
    const page = (
      <HelmetProvider context={helmetContext}>
        <Helmet>
          <title>Vite SSR app</title>
        </Helmet>

        <PageShell pageContext={pageContext}>
          <Page {...pageProps} />
        </PageShell>
      </HelmetProvider>
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
}
function onTransitionEnd() {
  console.log("Page transition end");
  document.querySelector("#page-view")!.classList.remove("page-transition");
}

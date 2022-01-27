import React from "react";
import ReactDOM from "react-dom";
import type { PageContextBuiltInClient } from "vite-plugin-ssr/client/router";
import { useClientRouter } from "vite-plugin-ssr/client/router";

import { getPageTitle } from "./getPageTitle";
import { PageShell } from "./PageShell";
import type { PageContext } from "./types";

// eslint-disable-next-line react-hooks/rules-of-hooks
const { hydrationPromise } = useClientRouter({
  render(pageContext: PageContextBuiltInClient & PageContext) {
    const { Page, pageProps } = pageContext;
    const page = (
      <PageShell pageContext={pageContext}>
        <Page {...pageProps} />
      </PageShell>
    );
    const container = document.getElementById("page-view");
    if (pageContext.isHydration) {
      ReactDOM.hydrate(page, container);
    } else {
      ReactDOM.render(page, container);
    }
    document.title = getPageTitle(pageContext);
  },
  onTransitionStart,
  onTransitionEnd,
});

hydrationPromise.then(() => {
  console.log("Hydration finished; page is now interactive.");
});

function onTransitionStart() {
  console.log("Page transition start");
  document.querySelector("#page-content")!.classList.add("page-transition");
}
function onTransitionEnd() {
  console.log("Page transition end");
  document.querySelector("#page-content")!.classList.remove("page-transition");
}

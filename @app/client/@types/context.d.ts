/* eslint-disable @typescript-eslint/consistent-type-imports */

// NOTE: the AppLoadContext must be kept in sync with @app/lib/LoaderContext

import "@remix-run/server-runtime";

// import { LoaderContext } from "@app/lib";

declare module "@remix-run/server-runtime" {
  interface AppLoadContext {
    cspNonce: import("@app/lib").LoaderContext["cspNonce"];
    csrfToken: import("@app/lib").LoaderContext["csrfToken"];
    graphqlSdk: import("@app/lib").LoaderContext["graphqlSdk"];
    validateCsrfToken: import("@app/lib").LoaderContext["validateCsrfToken"];
  }
}

/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

interface Window {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  ENV: import("~/root").BROWSER_ENV;
}

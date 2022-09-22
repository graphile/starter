import type { BROWSER_ENV } from "~/root";

export {};

declare global {
  interface Window {
    ENV: BROWSER_ENV;
  }
}

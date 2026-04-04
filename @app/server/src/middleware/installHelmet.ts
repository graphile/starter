import { Express } from "express";
import type { HelmetOptions } from "helmet" assert { "resolution-mode": "import" };

const tmpRootUrl = process.env.ROOT_URL;

if (!tmpRootUrl || typeof tmpRootUrl !== "string") {
  throw new Error("Envvar ROOT_URL is required.");
}
const ROOT_URL = tmpRootUrl;

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

export default async function installHelmet(app: Express) {
  const { default: helmet, contentSecurityPolicy } = await import("helmet");

  const options: HelmetOptions = {
    contentSecurityPolicy: {
      directives: {
        ...contentSecurityPolicy.getDefaultDirectives(),
        "connect-src": [
          "'self'",
          // Safari doesn't allow using wss:// origins as 'self' from
          // an https:// page, so we have to translate explicitly for
          // it.
          ROOT_URL.replace(/^http/, "ws"),
        ],
      },
    },
  };
  // Appease TypeScript
  if (
    typeof options.contentSecurityPolicy === "boolean" ||
    !options.contentSecurityPolicy
  ) {
    throw new Error(`contentSecurityPolicy must be an object`);
  }
  if (isDev) {
    // Disable HSTS in dev so browsers don't cache "always use HTTPS" for localhost
    options.hsts = false;

    // Remove upgrade-insecure-requests in dev — it causes browsers to upgrade
    // subresource requests to HTTPS even when the server only speaks HTTP.
    options.contentSecurityPolicy.directives!["upgrade-insecure-requests"] =
      null;
  }
  if (isDev || isTest) {
    // Dev needs 'unsafe-eval' due to
    // https://github.com/vercel/next.js/issues/14221
    options.contentSecurityPolicy.directives!["script-src"] = [
      "'self'",
      "'unsafe-eval'",
    ];
  }
  if (isDev || isTest || !!process.env.ENABLE_GRAPHIQL) {
    // Enables prettier script and SVG icon in GraphiQL
    options.crossOriginEmbedderPolicy = false;
  }
  app.use(helmet(options));
}

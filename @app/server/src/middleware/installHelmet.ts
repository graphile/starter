import { Express } from "express";
import helmet from "helmet";

const tmpRootUrl = process.env.ROOT_URL;

if (!tmpRootUrl || typeof tmpRootUrl !== "string") {
  throw new Error("Envvar ROOT_URL is required.");
}
const ROOT_URL = tmpRootUrl;

const isDevOrTest =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const CSP_DIRECTIVES = {
  ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  "connect-src": [
    "'self'",
    // Safari doesn't allow using wss:// origins as 'self' from
    // an https:// page, so we have to translate explicitly for
    // it.
    ROOT_URL.replace(/^http/, "ws"),
    // ws://localhost:24678
    ROOT_URL.replace(/^http/, "ws").replace(/5678/, "24678"),
  ],
};

export default function installHelmet(app: Express) {
  app.use(
    helmet(
      isDevOrTest
        ? {
            contentSecurityPolicy: {
              directives: {
                ...CSP_DIRECTIVES,
                // Dev needs 'unsafe-inline' when using vite-ssr
                "script-src": ["'self'", "'unsafe-inline'"],
              },
            },
          }
        : {
            contentSecurityPolicy: {
              directives: {
                ...CSP_DIRECTIVES,
              },
            },
          }
    )
  );
}

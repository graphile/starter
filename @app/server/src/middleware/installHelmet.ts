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
                // Dev needs 'unsafe-eval' due to
                // https://github.com/vercel/next.js/issues/14221
                "script-src": ["'self'", "'unsafe-eval'"],
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

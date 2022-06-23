import crypto from "crypto";
import { Express } from "express";
import helmet from "helmet";

const tmpRootUrl = process.env.ROOT_URL;

if (!tmpRootUrl || typeof tmpRootUrl !== "string") {
  throw new Error("Envvar ROOT_URL is required.");
}
const ROOT_URL = tmpRootUrl;

const isDevOrTest =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const isDev = process.env.NODE_ENV === "development";

const CSP_DIRECTIVES = (cspNonce: string) => ({
  ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  "connect-src": [
    "'self'",
    // Safari doesn't allow using wss:// origins as 'self' from
    // an https:// page, so we have to translate explicitly for
    // it.
    ROOT_URL.replace(/^http/, "ws"),
    // Include remix live reload support on port 8002 for development
    ...(isDev
      ? [ROOT_URL.replace(/^http/, "ws").replace(/:?\d*$/, ":8002")]
      : []),
  ],
  "script-src": ["'self'", `'nonce-${cspNonce}'`],
});

/**
 * This is require to include the `origin` header in POST requests when
 * javascript is disabled, in Remix. This allows Session middleware to work by
 * enabling the request to be detected as same-origin via `installSameOrigin`
 * middleware.
 */
const REFERRER_POLICY = { policy: "strict-origin-when-cross-origin" };

export default function installHelmet(app: Express) {
  // Add a cryptographic nonce for remix support
  app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
    const cspDirectives = CSP_DIRECTIVES(res.locals.cspNonce);
    const helmetMiddleware = helmet(
      isDevOrTest
        ? {
            contentSecurityPolicy: {
              directives: {
                ...cspDirectives,
                // Dev needs 'unsafe-eval' due to
                // https://github.com/vercel/next.js/issues/14221
                "script-src": [...cspDirectives["script-src"], "'unsafe-eval'"],
              },
            },
            referrerPolicy: REFERRER_POLICY,
          }
        : {
            contentSecurityPolicy: {
              directives: {
                ...cspDirectives,
              },
            },
            referrerPolicy: REFERRER_POLICY,
          }
    );
    helmetMiddleware(req, res, next);
  });
}

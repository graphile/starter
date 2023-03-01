import { Express } from "express";
import helmet, { HelmetOptions } from "helmet";
import { ContentSecurityPolicyOptions } from "node_modules/helmet/dist/types/middlewares/content-security-policy";

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
  const options: HelmetOptions = {
    contentSecurityPolicy: {
      directives: {
        ...CSP_DIRECTIVES,
      },
    },
  };
  if (isDevOrTest) {
    // Dev needs 'unsafe-eval' due to
    // https://github.com/vercel/next.js/issues/14221
    (options.contentSecurityPolicy as ContentSecurityPolicyOptions).directives![
      "script-src"
    ] = ["'self'", "'unsafe-eval'"];
  }
  if (isDevOrTest || !!process.env.ENABLE_GRAPHIQL) {
    // Enables prettier script and SVG icon in GraphiQL
    options.crossOriginEmbedderPolicy = false;
  }
  app.use(helmet(options));
}

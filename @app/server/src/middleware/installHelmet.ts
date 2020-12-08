import { Express } from "express";
import helmet from "helmet";

const isDevOrTest =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

export default function installHelmet(app: Express) {
  app.use(
    helmet(
      isDevOrTest
        ? {
            // Dev needs 'unsafe-eval' due to
            // https://github.com/vercel/next.js/issues/14221
            contentSecurityPolicy: {
              directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "script-src": ["'self'", "'unsafe-eval'"],
              },
            },
          }
        : {}
    )
  );
}

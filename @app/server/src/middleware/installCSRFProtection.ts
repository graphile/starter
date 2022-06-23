import csrf from "csurf";
import { Express } from "express";

export default (app: Express) => {
  const csrfProtection = csrf({
    // Store to the session rather than a Cookie
    cookie: false,
  });

  const insecureCsrfProtection = csrf({
    cookie: false,
    ignoreMethods: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  app.use((req, res, next) => {
    if (
      req.method === "POST" &&
      req.path === "/graphql" &&
      (req.headers.referer === `${process.env.ROOT_URL}/graphiql` ||
        req.headers.origin === process.env.ROOT_URL)
    ) {
      // Bypass CSRF for GraphiQL
      next();
    } else if (req.path.startsWith("/graphql")) {
      csrfProtection(req, res, next);
    } else {
      // disable CSRF parsing for remix, but still add `req.csrfToken()` method
      insecureCsrfProtection(req, res, next);
    }
  });
};

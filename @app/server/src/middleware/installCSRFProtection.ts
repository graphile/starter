import csrf from "csurf";
import { Express } from "express";

export default (app: Express) => {
  const csrfProtection = csrf({
    // Store to the session rather than a Cookie
    cookie: false,

    // Extract the CSRF Token from the `CSRF-Token` header.
    value(req) {
      const csrfToken = req.headers["csrf-token"];
      return typeof csrfToken === "string" ? csrfToken : "";
    },
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
    } else {
      csrfProtection(req, res, next);
    }
  });
};

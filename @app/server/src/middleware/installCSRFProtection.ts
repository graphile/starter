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

  app.use(csrfProtection);
};

import csrf from "csurf";
import { Express } from "express";
import url from "url";

const skipList = process.env.CSRF_SKIP_REFERERS
  ? process.env.CSRF_SKIP_REFERERS?.replace(/s\s/g, "")
      .split(",")
      .map((s) => {
        // It is prefixed with a protocol
        if (s.indexOf("//") !== -1) {
          const { host: skipHost } = url.parse(s);
          return skipHost;
        }

        return s;
      })
  : [];

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
      req.headers.referer === `${process.env.ROOT_URL}/graphiql`
    ) {
      // Bypass CSRF for GraphiQL
      next();
    } else if (
      skipList &&
      skipList.includes(url.parse(req.headers.referer || "").host)
    ) {
      // Bypass CSRF for named referers
      next();
    } else {
      csrfProtection(req, res, next);
    }
  });
};

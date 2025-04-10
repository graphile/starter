import { Express, Request, Response, NextFunction } from "express";
import { createCsrfMiddleware } from "@edge-csrf/express";

export default (app: Express) => {
  const csrf = createCsrfMiddleware({
    cookie: {
      secure: process.env.NODE_ENV === "production",
    },
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      req.method === "POST" &&
      req.path === "/graphql" &&
      (req.headers.referer === `${process.env.ROOT_URL}/graphiql` ||
        req.headers.origin === process.env.ROOT_URL)
    ) {
      // Bypass CSRF for GraphiQL
      return next();
    }

    csrf(req, res, next);
  });
};

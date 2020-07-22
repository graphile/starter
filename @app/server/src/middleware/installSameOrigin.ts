import { Express, RequestHandler } from "express";

import { getWebsocketMiddlewares } from "../app";

declare module "express-serve-static-core" {
  interface Request {
    /**
     * True if either the request 'Origin' header matches our ROOT_URL, or if
     * there was no 'Origin' header (in which case we must give the benefit of
     * the doubt; for example for normal resource GETs).
     */
    isSameOrigin?: boolean;
  }
}

export default (app: Express) => {
  const middleware: RequestHandler = (req, res, next) => {
    req.isSameOrigin =
      !req.headers.origin || req.headers.origin === process.env.ROOT_URL;
    next();
  };
  app.use(middleware);
  getWebsocketMiddlewares(app).push(middleware);
};

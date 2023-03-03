import { Express, Request, Response } from "express";
import { enhanceHttpServerWithSubscriptions, postgraphile } from "postgraphile";

import { getHttpServer, getWebsocketMiddlewares } from "../app";
import { getPostGraphileOptions } from "../graphile.config";
import { getAuthPgPool, getRootPgPool } from "./installDatabasePools";

export default function installPostGraphile(app: Express) {
  const websocketMiddlewares = getWebsocketMiddlewares(app);
  const authPgPool = getAuthPgPool(app);
  const rootPgPool = getRootPgPool(app);
  const httpServer = getHttpServer(app);
  const middleware = postgraphile<Request, Response>(
    authPgPool,
    "app_public",
    getPostGraphileOptions({
      websocketMiddlewares,
      rootPgPool,
    })
  );

  app.set("postgraphileMiddleware", middleware);

  app.use(middleware);

  if (httpServer) {
    enhanceHttpServerWithSubscriptions(httpServer, middleware);
  }
}

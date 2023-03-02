import { Express, Request, Response } from "express";
import { postgraphile, enhanceHttpServerWithSubscriptions } from "postgraphile";

import { getHttpServer, getWebsocketMiddlewares } from "../app";
import { getAuthPgPool, getRootPgPool } from "./installDatabasePools";
import { getPostGraphileOptions } from "../graphile.config";

export default function installPostGraphile(app: Express) {
  const websocketMiddlewares = getWebsocketMiddlewares(app);
  const authPgPool = getAuthPgPool(app);
  const rootPgPool = getRootPgPool(app);
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

  const httpServer = getHttpServer(app);
  if (httpServer) {
    enhanceHttpServerWithSubscriptions(httpServer, middleware);
  }
}

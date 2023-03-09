import { Express, Request, Response } from "express";
import { createServer } from "http";
import { enhanceHttpServerWithSubscriptions, postgraphile } from "postgraphile";

import {
  getHttpServer,
  getUpgradeHandlers,
  getWebsocketMiddlewares,
} from "../app";
import { getPostGraphileOptions } from "../graphile.config";
import { getAuthPgPool, getRootPgPool } from "./installDatabasePools";

export default async function installPostGraphile(app: Express) {
  const websocketMiddlewares = getWebsocketMiddlewares(app);
  const authPgPool = getAuthPgPool(app);
  const rootPgPool = getRootPgPool(app);
  const httpServer = getHttpServer(app);
  // Forbid PostGraphile from adding websocket listeners to httpServer
  (httpServer as any)["__postgraphileSubscriptionsEnabled"] = true;
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

  // Extract the upgrade handler from PostGraphile so we can mix it with
  // other upgrade handlers.
  const fakeHttpServer = createServer();
  await enhanceHttpServerWithSubscriptions(fakeHttpServer, middleware);
  const postgraphileUpgradeHandler = fakeHttpServer.listeners(
    "upgrade"
  )[0] as any;
  // Prevent PostGraphile registering its websocket handler

  // Now handle websockets
  if (postgraphileUpgradeHandler) {
    const upgradeHandlers = getUpgradeHandlers(app);
    upgradeHandlers.push({
      name: "PostGraphile",
      check(req) {
        return (
          (req.url === "/graphql" || req.url?.startsWith("/graphql?")) ?? false
        );
      },
      upgrade: postgraphileUpgradeHandler,
    });
  }
}

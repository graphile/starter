import { Express } from "express";
import { postgraphile } from "postgraphile";
import { grafserv } from "grafserv/express/v4";

import { getHttpServer, getUpgradeHandlers } from "../app";
import { getPreset } from "../graphile.config";
import { getAuthPgPool, getRootPgPool } from "./installDatabasePools";

export default async function installPostGraphile(app: Express) {
  // const websocketMiddlewares = getWebsocketMiddlewares(app);
  const authPgPool = getAuthPgPool(app);
  const rootPgPool = getRootPgPool(app);
  const httpServer = getHttpServer(app);

  const pgl = postgraphile(
    getPreset({
      authPgPool,
      //websocketMiddlewares,
      rootPgPool,
    })
  );

  app.set("pgl", pgl);

  const serv = pgl.createServ(grafserv);
  serv.addTo(app, httpServer, false);

  // Handle websockets
  const onUpgrade = await serv.getUpgradeHandler();
  if (onUpgrade) {
    const upgradeHandlers = getUpgradeHandlers(app);
    upgradeHandlers.push({
      check: serv.shouldHandleUpgrade.bind(serv),
      upgrade: onUpgrade,
    });
  }
}

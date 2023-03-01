import { Express } from "express";
import { postgraphile } from "postgraphile";
import { grafserv } from "grafserv/express/v4";

import { getHttpServer } from "../app";
import { getAuthPgPool, getRootPgPool } from "./installDatabasePools";
import { getPreset } from "../graphile.config";

export default function installPostGraphile(app: Express) {
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
  serv.addTo(app, httpServer);
}

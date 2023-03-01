import { Express, Request, Response } from "express";
import { createServer } from "http";
import { postgraphile } from "postgraphile";
import { grafserv } from "grafserv/express/v4";

import {
  getHttpServer,
  getUpgradeHandlers,
  getWebsocketMiddlewares,
} from "../app";
import { getPreset } from "../graphile.config";
import { getAuthPgPool, getRootPgPool } from "./installDatabasePools";
import { ServerResponse } from "http";
import { OutgoingHttpHeaders } from "http2";

export default async function installPostGraphile(app: Express) {
  const websocketMiddlewares = getWebsocketMiddlewares(app);
  const authPgPool = getAuthPgPool(app);
  const rootPgPool = getRootPgPool(app);
  const httpServer = getHttpServer(app);

  const pgl = postgraphile(
    getPreset({
      authPgPool,
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
      name: "PostGraphile",
      check: serv.shouldHandleUpgrade.bind(serv),
      async upgrade(originalReq, socket, head) {
        const req = originalReq as Request;
        // Create a "dummy" response to trick our small array of middlewares into running
        const dummyRes = new ServerResponse(req) as Response;
        dummyRes.writeHead = ((
          statusCode: number,
          _statusMessage?: OutgoingHttpHeaders | string | undefined,
          headers?: OutgoingHttpHeaders | undefined
        ): Response => {
          if (statusCode && statusCode > 200) {
            // tslint:disable-next-line no-console
            console.error(
              `Something used 'writeHead' to write a '${statusCode}' error for websockets - check the middleware you're passing!`
            );
            socket.destroy();
          } else if (headers) {
            // tslint:disable-next-line no-console
            console.error(
              "Passing headers to 'writeHead' is not supported with websockets currently - check the middleware you're passing"
            );
            socket.destroy();
          }
          return dummyRes;
        }) as any;
        (req as any).res = dummyRes;
        // Apply websocket middlewares
        try {
          for (const middleware of websocketMiddlewares) {
            await new Promise<void>((resolve, reject) =>
              middleware(req, dummyRes, (err: any) =>
                err ? reject(err) : resolve()
              )
            );
          }
          return onUpgrade(req, socket, head);
        } catch (e) {
          console.error(
            "Error occurred whilst applying websocket middlewares",
            e
          );
          socket.destroy();
        }
      },
    });
  }
}

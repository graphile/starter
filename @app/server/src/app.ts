import { Server } from "http";
import express, { Express } from "express";
import * as middleware from "./middleware";
import { makeShutdownActions, ShutdownAction } from "./shutdownActions";
import { Middleware } from "postgraphile";

export function getTyped(app: Express, key: "httpServer"): Server | void; // Server may not always be supplied, e.g. where mounting on a subroute
export function getTyped(
  app: Express,
  key: "shutdownActions"
): ShutdownAction[];
export function getTyped(
  app: Express,
  key: "websocketMiddlewares"
): Middleware<express.Request, express.Response>[];
/**
 * By default, app.get(string) returns 'any'; but we know what the types will
 * be of certain things, so we've created the `getTyped` function that'll
 * automatically get the right type for the given key. Always use this over
 * `app.get(string)`.
 */
export function getTyped(app: Express, key: string): any {
  return app.get(key);
}

export async function makeApp({
  installNext = true,
  httpServer,
}: {
  installNext?: boolean;
  httpServer?: Server;
} = {}): Promise<Express> {
  const isTest = process.env.NODE_ENV === "test";
  const isDev = process.env.NODE_ENV === "development";

  const shutdownActions = makeShutdownActions();

  if (isDev) {
    shutdownActions.push(() => require("inspector").close());
  }

  /*
   * Our Express server
   */
  const app = express();

  /*
   * Getting access to the HTTP server directly means that we can do things
   * with websockets if we need to (e.g. GraphQL subscriptions).
   */
  app.set("httpServer", httpServer);

  /*
   * For a clean nodemon shutdown, we need to close all our sockets otherwise
   * we might not come up cleanly again (inside nodemon).
   */
  app.set("shutdownActions", shutdownActions);

  /*
   * When we're using websockets, we may want them to have access to
   * sessions/etc for authentication.
   */
  const websocketMiddlewares: Middleware<
    express.Request,
    express.Response
  >[] = [];
  app.set("websocketMiddlewares", websocketMiddlewares);

  /*
   * Middleware is installed from the /server/middleware directory. These
   * helpers may augment the express app with new settings and/or install
   * express middleware. These helpers may be asynchronous, but they should
   * operate very rapidly to enable quick as possible server startup.
   */
  await middleware.installDatabasePools(app);
  await middleware.installHelmet(app);
  await middleware.installSession(app);
  await middleware.installPassport(app);
  await middleware.installLogging(app);
  // These are our assets: images/etc; served out of the /@app/server/public folder (if present)
  await middleware.installSharedStatic(app);
  if (isTest || isDev) {
    await middleware.installCypressServerCommand(app);
  }
  await middleware.installPostGraphile(app);
  if (installNext) {
    await middleware.installNext(app);
  }

  /*
   * Error handling middleware
   */
  await middleware.installErrorHandler(app);

  return app;
}

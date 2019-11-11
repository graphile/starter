#!/usr/bin/env node
/* eslint-disable no-console */
import * as express from "express";
import { sanitiseEnv } from "./utils";
import * as middleware from "./middleware";

export default async () => {
  sanitiseEnv();

  const isTest = process.env.NODE_ENV === "test";
  const isDev = process.env.NODE_ENV === "development";

  /*
   * Our Express server
   */
  const app = express();

  /*
   * When we're using websockets, we may want them to have access to
   * sessions/etc for authentication.
   */
  const websocketMiddlewares: express.RequestHandler[] = [];
  app.set("websocketMiddlewares", websocketMiddlewares);

  /*
   * installs shutdownActions so it's available
   * inside other middleware and after it
   */
  const shutdownActions: (() => any)[] = [];
  app.set("shutdownActions", shutdownActions);

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
  // These are our assets: images/etc; served out of the /client/public folder
  await middleware.installSharedStatic(app);
  if (isTest || isDev) {
    await middleware.installCypressServerCommand(app);
  }
  await middleware.installPostGraphile(app);

  /*
   * Error handling middleware
   */
  await middleware.installErrorHandler(app);

  return app;
};

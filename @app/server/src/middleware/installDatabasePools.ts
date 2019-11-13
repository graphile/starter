import { Pool } from "pg";
import { Express } from "express";
import { getTyped } from "../app";

declare module "../app" {
  // Tell the rest of our code about the settings we're making available on the Express app
  export function getTyped(app: Express, field: "rootPgPool"): Pool;
  export function getTyped(app: Express, field: "authPgPool"): Pool;
}

export default (app: Express) => {
  // This pool runs as the database owner, so it can do anything.
  const rootPgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  app.set("rootPgPool", rootPgPool);

  // This pool runs as the unprivileged user, it's what PostGraphile uses.
  const authPgPool = new Pool({
    connectionString: process.env.AUTH_DATABASE_URL,
  });
  app.set("authPgPool", authPgPool);

  const shutdownActions = getTyped(app, "shutdownActions");
  shutdownActions.push(() => rootPgPool.end());
  shutdownActions.push(() => authPgPool.end());
};

/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import { Pool } from "pg";
import { Application } from "express";

export default (app: Application) => {
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
};

import {
  MAXIMUM_SESSION_DURATION_IN_MILLISECONDS,
  REDIS_URL,
  SECRET,
} from "@app/config";
import ConnectPgSimple from "connect-pg-simple";
import ConnectRedis from "connect-redis";
import { Express, RequestHandler } from "express";
import session from "express-session";
import * as redis from "redis";

import { getWebsocketMiddlewares } from "../app";
import { getRootPgPool } from "./installDatabasePools";

const RedisStore = ConnectRedis(session);
const PgStore = ConnectPgSimple(session);

export default (app: Express) => {
  const rootPgPool = getRootPgPool(app);

  const store = REDIS_URL
    ? /*
       * Using redis for session storage means the session can be shared across
       * multiple Node.js instances (and survives a server restart), see:
       *
       * https://medium.com/mtholla/managing-node-js-express-sessions-with-redis-94cd099d6f2f
       */
      new RedisStore({
        client: redis.createClient({
          url: REDIS_URL,
        }),
      })
    : /*
       * Using PostgreSQL for session storage is easy to set up, but increases
       * the load on your database. We recommend that you graduate to using
       * redis for session storage when you're ready.
       */
      new PgStore({
        /*
         * Note even though "connect-pg-simple" lists "pg@7.x" as a dependency,
         * it doesn't `require("pg")` if we pass it a pool. It's usage of the pg
         * API is small; so it's compatible with pg@8.x.
         */
        pool: rootPgPool,
        schemaName: "app_private",
        tableName: "connect_pg_simple_sessions",
      });

  const sessionMiddleware = session({
    rolling: true,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: MAXIMUM_SESSION_DURATION_IN_MILLISECONDS,
      httpOnly: true, // default
      sameSite: "lax", // Cannot be 'strict' otherwise OAuth won't work.
      secure: "auto", // May need to app.set('trust proxy') for this to work.
    },
    store,
    secret: SECRET,
  });

  /**
   * For security reasons we only enable sessions for requests within the our
   * own website; external URLs that need to issue requests to us must use a
   * different authentication method such as bearer tokens.
   */
  const wrappedSessionMiddleware: RequestHandler = (req, res, next) => {
    if (req.isSameOrigin) {
      sessionMiddleware(req, res, next);
    } else {
      next();
    }
  };

  app.use(wrappedSessionMiddleware);
  getWebsocketMiddlewares(app).push(wrappedSessionMiddleware);
};

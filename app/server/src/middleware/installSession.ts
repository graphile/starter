import * as session from "express-session";
import * as ConnectRedis from "connect-redis";
import * as ConnectPgSimple from "connect-pg-simple";
import { Application } from "express";

const RedisStore = ConnectRedis(session);
const PgStore = ConnectPgSimple(session);

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const { SECRET = String(Math.random()) } = process.env;
const MAXIMUM_SESSION_DURATION_IN_MILLISECONDS =
  parseInt(process.env.MAXIMUM_SESSION_DURATION_IN_MILLISECONDS || "", 10) ||
  3 * DAY;

export default (app: Application) => {
  const rootPgPool = app.get("rootPgPool");

  const store = process.env.REDIS_URL
    ? /*
       * Using redis for session storage means the session can be shared across
       * multiple Node.js instances (and survives a server restart), see:
       *
       * https://medium.com/mtholla/managing-node-js-express-sessions-with-redis-94cd099d6f2f
       */
      new RedisStore({
        url: process.env.REDIS_URL,
      })
    : /*
       * Using PostgreSQL for session storage is easy to set up, but increases
       * the load on your database. We recommend that you graduate to using
       * redis for session storage when you're ready.
       */
      new PgStore({
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
    },
    store,
    secret: SECRET,
  });

  app.use(sessionMiddleware);
  app.get("websocketMiddlewares").push(sessionMiddleware);
};

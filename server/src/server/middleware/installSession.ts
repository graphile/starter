import * as session from "express-session";
import * as ConnectRedis from "connect-redis";
import { Application } from "express";

const RedisStore = ConnectRedis(session);

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
  const sessionMiddleware = session({
    rolling: true,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: MAXIMUM_SESSION_DURATION_IN_MILLISECONDS,
    },
    store: process.env.REDIS_URL
      ? new RedisStore({
          url: process.env.REDIS_URL,
        })
      : undefined,
    secret: SECRET,
  });
  app.use(sessionMiddleware);
  app.get("socketMiddlewares").push(sessionMiddleware);
};

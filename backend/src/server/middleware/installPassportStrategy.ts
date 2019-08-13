/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import * as passport from "passport";
import { RequestHandler, Application, Request } from "express";

export interface UserSpec {
  id: number;
  displayName: string;
  username: string;
  avatarUrl?: string;
  email: string;
  profile?: any;
  auth?: any;
}

export type GetUserInformationFunction = (
  profile: any,
  accessToken: string,
  refershToken: string,
  extra: any,
  req: Request
) => UserSpec | Promise<UserSpec>;

/*
 * Stores where to redirect the user to on authentication success.
 * Tries to avoid redirect loops or malicious redirects.
 */
const setReturnTo: RequestHandler = (req, _res, next) => {
  const BLOCKED_REDIRECT_PATHS = /^\/+(|auth.*|logout)(\?.*)?$/;
  if (!req.session) {
    next();
    return;
  }
  const returnTo =
    (req.query && req.query.next && String(req.query.next)) ||
    req.session.returnTo;
  if (
    returnTo &&
    returnTo[0] === "/" &&
    !returnTo.match(BLOCKED_REDIRECT_PATHS)
  ) {
    req.session.returnTo = returnTo;
  } else {
    delete req.session.returnTo;
  }
  next();
};

export default (
  app: Application,
  service: string,
  Strategy: new (...args: any) => passport.Strategy,
  strategyConfig: any,
  authenticateConfig: any,
  getUserInformation: GetUserInformationFunction,
  tokenNames = ["accessToken", "refreshToken"],
  {
    preRequest = (_req: Request) => {},
    postRequest = (_req: Request) => {},
  } = {}
) => {
  const rootPgPool = app.get("rootPgPool");

  passport.use(
    new Strategy(
      {
        ...strategyConfig,
        callbackURL: `${process.env.ROOT_URL}/auth/${service}/callback`,
        passReqToCallback: true,
      },
      async (
        req: Request,
        accessToken: string,
        refreshToken: string,
        extra: any,
        profile: any,
        done: (error: any, user?: any) => void
      ) => {
        try {
          const userInformation = await getUserInformation(
            profile,
            accessToken,
            refreshToken,
            extra,
            req
          );
          if (!userInformation.id) {
            throw new Error(
              `getUserInformation must return a unique id for each user`
            );
          }
          const {
            rows: [details],
          } = await rootPgPool.query(
            `with new_user as (
              select * from app_private.link_or_register_user($1, $2, $3, $4, $5)
            ), new_session as (
              insert into app_private.sessions (user_id)
              select id from new_user
              returning *
            )
            select new_user.id as user_id, new_session.uuid as session_id
            from new_user, new_session`,
            [
              (req.user && req.user.id) || null,
              service,
              userInformation.id,
              JSON.stringify({
                username: userInformation.username,
                avatar_url: userInformation.avatarUrl,
                email: userInformation.email,
                name: userInformation.displayName,
                ...userInformation.profile,
              }),
              JSON.stringify({
                [tokenNames[0]]: accessToken,
                [tokenNames[1]]: refreshToken,
                ...userInformation.auth,
              }),
            ]
          );
          if (!details || !details.user_id) {
            const e = new Error("Registration failed");
            e["code"] = "FFFFF";
            throw e;
          }
          done(null, { session_id: details.session_id });
        } catch (e) {
          done(e);
        }
      }
    )
  );

  app.get(`/auth/${service}`, setReturnTo, async (req, res, next) => {
    try {
      await preRequest(req);
    } catch (e) {
      next(e);
      return;
    }
    const realAuthDetails =
      typeof authenticateConfig === "function"
        ? authenticateConfig(req)
        : authenticateConfig;
    const step1Middleware = passport.authenticate(service, realAuthDetails);
    step1Middleware(req, res, next);
  });

  const step2Middleware = passport.authenticate(service, {
    failureRedirect: "/login",
    successReturnToOrRedirect: "/",
  });

  app.get(`/auth/${service}/callback`, async (req, res, next) => {
    try {
      await postRequest(req);
    } catch (e) {
      next(e);
      return;
    }
    step2Middleware(req, res, next);
  });
};

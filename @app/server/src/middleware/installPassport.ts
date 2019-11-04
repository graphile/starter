import * as passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github";
import { get } from "lodash";
import installPassportStrategy from "./installPassportStrategy";
import { Application } from "express";

interface DbSession {
  session_id: string;
}

declare global {
  namespace Express {
    interface User {
      session_id: string;
    }
  }
}

export default async (app: Application) => {
  passport.serializeUser((sessionObject: DbSession, done) => {
    done(null, sessionObject.session_id);
  });

  passport.deserializeUser((session_id: string, done) => {
    done(null, { session_id });
  });

  const passportInitializeMiddleware = passport.initialize();
  app.use(passportInitializeMiddleware);
  app.get("websocketMiddlewares").push(passportInitializeMiddleware);

  const passportSessionMiddleware = passport.session();
  app.use(passportSessionMiddleware);
  app.get("websocketMiddlewares").push(passportSessionMiddleware);

  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  if (process.env.GITHUB_KEY) {
    await installPassportStrategy(
      app,
      "github",
      GitHubStrategy,
      {
        clientID: process.env.GITHUB_KEY,
        clientSecret: process.env.GITHUB_SECRET,
        scope: ["user:email"],
      },
      {},
      async (profile, _accessToken, _refreshToken, _extra, _req) => ({
        id: profile.id,
        displayName: profile.displayName || "",
        username: profile.username,
        avatarUrl: get(profile, "photos.0.value"),
        email: profile.email || get(profile, "emails.0.value"),
      }),
      ["token", "tokenSecret"]
    );
  }
};

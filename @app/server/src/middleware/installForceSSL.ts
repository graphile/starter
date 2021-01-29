import { Express } from "express";

export default (app: Express) => {
  if (!process.env.ROOT_URL || !process.env.ROOT_URL.startsWith("https://")) {
    throw new Error(
      "Invalid configuration - FORCE_SSL is enabled, but ROOT_URL doesn't start with https://"
    );
  }
  app.use((req, res, next) => {
    if (req.protocol !== "https") {
      if (req.method === "GET" || req.method === "HEAD") {
        res.redirect(`${process.env.ROOT_URL}${req.path}`);
      } else {
        res
          .status(405)
          .send(`'${req.method}' requests may only be performed over HTTPS.`);
      }
    } else {
      next();
    }
  });
};

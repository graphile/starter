import * as next from "next";
import { Application } from "express";

if (!process.env.NODE_ENV) {
  throw new Error("No NODE_ENV envvar! Try `export NODE_ENV=development`");
}

const isDev = process.env.NODE_ENV !== "production";

export default async function installNext(app: Application) {
  const nextApp = next({
    dev: isDev,
    dir: `${__dirname}/../../../../client/src`,
    quiet: !isDev,
    // Don't specify 'conf' key
  });
  await nextApp.prepare();
  const handler = nextApp.getRequestHandler();
  app.get("*", (req, res) => {
    handler(req, res);
  });
}

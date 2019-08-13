/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
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
  const handlerPromise = (async () => {
    await nextApp.prepare();
    return nextApp.getRequestHandler();
  })();
  // Foo
  handlerPromise.catch(e => {
    console.error("Error occurred starting Next.js; aborting process");
    console.error(e);
    process.exit(1);
  });
  app.get("*", async (req, res) => {
    const handler = await handlerPromise;
    handler(req, res);
  });
}

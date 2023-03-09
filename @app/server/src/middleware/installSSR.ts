import { Express } from "express";
import { createServer } from "http";
import next from "next";
import { parse } from "url";

import { getUpgradeHandlers } from "../app";

if (!process.env.NODE_ENV) {
  throw new Error("No NODE_ENV envvar! Try `export NODE_ENV=development`");
}

const isDev = process.env.NODE_ENV === "development";

export default async function installSSR(app: Express) {
  const fakeHttpServer = createServer();
  const nextApp = next({
    dev: isDev,
    dir: `${__dirname}/../../../client/src`,
    quiet: !isDev,
    // Don't specify 'conf' key

    // Trick Next.js into adding its upgrade handler here, so we can extract
    // it. Calling `getUpgradeHandler()` is insufficient because that doesn't
    // handle the assets.
    httpServer: fakeHttpServer,
  });
  const handlerPromise = (async () => {
    await nextApp.prepare();
    return nextApp.getRequestHandler();
  })();
  handlerPromise.catch((e) => {
    console.error("Error occurred starting Next.js; aborting process");
    console.error(e);
    process.exit(1);
  });
  app.get("*", async (req, res) => {
    const handler = await handlerPromise;
    const parsedUrl = parse(req.url, true);
    handler(req, res, {
      ...parsedUrl,
      query: {
        ...parsedUrl.query,
        CSRF_TOKEN: req.csrfToken(),
        // See 'next.config.js':
        ROOT_URL: process.env.ROOT_URL || "http://localhost:5678",
        T_AND_C_URL: process.env.T_AND_C_URL,
      },
    });
  });

  // Now handle websockets
  if (!(nextApp as any).getServer) {
    console.warn(
      `Our Next.js workaround for getting the upgrade handler without giving Next.js dominion over all websockets might no longer work - nextApp.getServer (private API) is no more.`
    );
  } else {
    await (nextApp as any).getServer();
  }
  const nextJsUpgradeHandler = fakeHttpServer.listeners("upgrade")[0] as any;
  if (nextJsUpgradeHandler) {
    const upgradeHandlers = getUpgradeHandlers(app);
    upgradeHandlers.push({
      name: "Next.js",
      check(req) {
        return req.url?.includes("/_next/") ?? false;
      },
      upgrade: nextJsUpgradeHandler,
    });
  }
}

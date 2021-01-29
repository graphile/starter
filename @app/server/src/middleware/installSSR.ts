import { isDev, ROOT_URL, T_AND_C_URL } from "@app/config";
import { Express } from "express";
import next from "next";
import { parse } from "url";

export default async function installSSR(app: Express) {
  const nextApp = next({
    dev: isDev,
    dir: `${__dirname}/../../../client/src`,
    quiet: !isDev,
    // Don't specify 'conf' key
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
        ROOT_URL,
        T_AND_C_URL,
      },
    });
  });
}

// TODO: fix to 'import next' when next fixes the bug
import { Express } from "express";
import next from "next";

if (!process.env.NODE_ENV) {
  throw new Error("No NODE_ENV envvar! Try `export NODE_ENV=development`");
}

const isDev = process.env.NODE_ENV === "development";

export default async function installSSR(app: Express) {
  // @ts-ignore Next had a bad typing file, they claim `export default` but should have `export =`
  // Ref: https://unpkg.com/next@9.0.3/dist/server/next.js
  console.log('nextjs', '|', 'Installing...');
  const nextApp = next({
    dev: isDev,
    dir: `${__dirname}/../../../client/src`,
    quiet: !isDev,
    // Don't specify 'conf' key
  });
  
  console.log('nextjs', '|', 'Preparing...');
  try {
    await nextApp.prepare();
  } catch (e) {
    console.error("Error occurred starting Next.js; aborting process");
    console.error(e);
    process.exit(1);
  }
  console.log('nextjs', '|', 'Prepared.');

  const handler = nextApp.getRequestHandler();
  app.get("*", async (req, res) => {
    handler(req, res);
  });
}

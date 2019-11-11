#!/usr/bin/env node
/* eslint-disable no-console */
import chalk from "chalk";
import { createServer } from "http";
import createApp from "./createApp";
import installNext from "./middleware/installNext";
// @ts-ignore
const packageJson = require("../../../package.json");

async function main() {
  const isDev = process.env.NODE_ENV === "development";

  const app = await createApp();

  await installNext(app);
  /*
   * Getting access to the HTTP server directly means that we can do things
   * with websockets if we need to (e.g. GraphQL subscriptions).
   */
  const httpServer = createServer(app);
  app.set("httpServer", httpServer);

  const shutdownActions = app.get("shutdownActions");
  if (isDev) {
    shutdownActions.push(() => require("inspector").close());
  }

  // And finally, we open the listen port
  const PORT = parseInt(process.env.PORT || "", 10) || 3000;
  httpServer.listen(PORT, () => {
    const address = httpServer.address();
    const actualPort: string =
      typeof address === "string"
        ? address
        : address && address.port
        ? String(address.port)
        : String(PORT);
    console.log();
    console.log(
      chalk.green(
        `${chalk.bold(packageJson.name)} listening on port ${chalk.bold(
          actualPort
        )}`
      )
    );
    console.log();
    console.log(
      `  Site:     ${chalk.bold.underline(`http://localhost:${actualPort}`)}`
    );
    console.log(
      `  GraphiQL: ${chalk.bold.underline(
        `http://localhost:${actualPort}/graphiql`
      )}`
    );
    console.log();
  });

  // Nodemon SIGUSR2 handling
  /*
   * For a clean nodemon shutdown, we need to close all our sockets otherwise
   * we might not come up cleanly again (inside nodemon).
   */
  shutdownActions.push(() => httpServer.close());

  async function gracefulShutdown(callback: () => void) {
    try {
      await Promise.all(shutdownActions.map((fn: any) => fn()));
    } finally {
      // 250ms of sleep before finally shutting down, give things a moment to
      // clear up.
      setTimeout(callback, 250);
    }
  }
  process.once("SIGUSR2", () => {
    gracefulShutdown(() => {
      process.kill(process.pid, "SIGUSR2");
    });
  });
}

main().catch(e => {
  console.error("Fatal error occurred starting server!");
  console.error(e);
  process.exit(101);
});

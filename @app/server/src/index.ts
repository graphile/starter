#!/usr/bin/env node
/* eslint-disable no-console */
import { IncomingMessage, createServer } from "http";

import { getShutdownActions, getUpgradeHandlers, makeApp } from "./app";
import { Duplex } from "stream";

// @ts-ignore
const packageJson = require("../../../package.json");

async function main() {
  const { default: chalk } = await import("chalk");

  // Create our HTTP server
  const httpServer = createServer();

  // Make our application (loading all the middleware, etc)
  const app = await makeApp({ httpServer });

  // Add our application to our HTTP server
  httpServer.addListener("request", app);

  const upgradeHandlers = getUpgradeHandlers(app);
  async function handleUpgrade(
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer
  ) {
    try {
      for (const upgradeHandler of upgradeHandlers) {
        if (await upgradeHandler.check(req, socket, head)) {
          upgradeHandler.upgrade(req, socket, head);
          return;
        }
      }
      // No handler matched:
      socket.destroy();
    } catch (e) {
      console.error(
        `Error occurred whilst trying to handle 'upgrade' event:`,
        e
      );
      socket.destroy();
    }
  }

  httpServer.addListener("upgrade", handleUpgrade);

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
        `${chalk.bold(packageJson.projectName)} listening on port ${chalk.bold(
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
  const shutdownActions = getShutdownActions(app);
  shutdownActions.push(() => {
    httpServer.removeListener("request", app);
    httpServer.removeListener("upgrade", handleUpgrade);
    httpServer.close();
  });
}

main().catch((e) => {
  console.error("Fatal error occurred starting server!");
  console.error(e);
  process.exit(101);
});

#!/usr/bin/env node

import concurrently from "concurrently";
import { $, sleep } from "zx";

require("@app/config/env");

// Dear graphile-migrate, please treat the test DB as if it were the shadow DB
process.env.SHADOW_DATABASE_URL = process.env.TEST_DATABASE_URL;

// Signal to graphile-migrate scripts that we're in the tests
process.env.IN_TESTS = "1";
process.env.NODE_ENV = "test";

const cmdArgs = process.argv.slice(2);
const watchMode = cmdArgs.find(
  (arg) => arg === "--watch" || arg === "--watchAll"
);
const delayArg = cmdArgs.indexOf("--delay");
let delaySeconds = null;

await $`yarn db gm reset --shadow --erase`;
await $`yarn db watch --once --shadow`;

if (delayArg > -1) {
  delaySeconds = parseFloat(cmdArgs[delayArg + 1]);
  console.log("delaySeconds");
  console.log(cmdArgs[delayArg + 1]);
  console.log(delaySeconds);
  if (isNaN(delaySeconds)) {
    throw new Error("Did not get a valid delay argument in seconds.");
  }
  sleep(delaySeconds * 1000);
}

if (watchMode) {
  // We're in watch mode, so keep watching the `current.yml` file
  concurrently(
    [
      {
        name: "jest",
        command: `cross-env NODE_OPTIONS=\"--inspect=9876\" jest -i ${watchMode}`,
        prefixColor: "greenBright",
      },
      {
        name: "testdb",
        command: "yarn db watch --shadow",
        prefixColor: "blue",
      },
    ],
    {
      killOthers: ["failure"],
    }
  );
} else {
  const argsWithoutDelayArg = cmdArgs
    .filter(([arg]) => arg !== "--delay")
    .join(" ");
  try {
    await $`jest -i ${argsWithoutDelayArg}`;
  } catch (err) {
    console.error(err);
  }
}

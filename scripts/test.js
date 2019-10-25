#!/usr/bin/env node

require("@app/config/env");
const { execSync, spawnSync } = require("child_process");
const concurrently = require("concurrently");

// Dear graphile-migrate, please treat the test DB as if it were the shadow DB
process.env.SHADOW_DATABASE_URL = process.env.TEST_DATABASE_URL;

// Signal to graphile-migrate scripts that we're in the tests
process.env.IN_TESTS = "1";

const opts = {
  stdio: "inherit",
  cwd: process.cwd(),
};

// Reset the test database
execSync("yarn db gm reset --shadow", opts);
execSync("yarn db watch --once --shadow", opts);

// If we're in watch mode
const arg = process.argv[2];
if (process.argv.length > 3) {
  throw new Error(
    `Extra arguments not understood '${process.argv.join("' '")}'`
  );
} else if (arg === "--watch" || arg === "--watchAll") {
  // We're in watch mode, so keep watching the `current.yml` file
  concurrently(
    [
      {
        name: "tests",
        command: `node --inspect=9876 node_modules/.bin/jest -i ${arg}`,
      },
      { name: "___db", command: "yarn db watch --shadow" },
    ],
    {
      killOthers: ["failure"],
    }
  );
} else if (arg) {
  throw new Error(`Argument '${arg}' not understood`);
} else {
  // Run once, so just run the tests
  spawnSync("jest", ["-i", ...process.argv.slice(2)], opts);
}

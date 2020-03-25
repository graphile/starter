#!/usr/bin/env node

require("@app/config/env");
const { execSync, spawnSync: rawSpawnSync } = require("child_process");
const concurrently = require("concurrently");

const spawnSync = (cmd, args, options) => {
  const result = rawSpawnSync(cmd, args, {
    stdio: ["pipe", "inherit", "inherit"],
    env: {
      ...process.env,
      YARN_SILENT: "1",
      npm_config_loglevel: "silent",
    },
    ...options,
  });

  const { error, status, signal, stderr, stdout } = result;

  if (error) {
    throw error;
  }

  if (status || signal) {
    if (stdout) {
      console.log(stdout.toString("utf8"));
    }
    if (stderr) {
      console.error(stderr.toString("utf8"));
    }
    if (status) {
      throw new Error(
        `Process exited with status '${status}' (running '${cmd} ${
          args ? args.join(" ") : ""
        }')`
      );
    } else {
      throw new Error(
        `Process exited due to signal '${signal}' (running '${cmd} ${
          args ? args.join(" ") : null
        }')`
      );
    }
  }

  return result;
};

// Dear graphile-migrate, please treat the test DB as if it were the shadow DB
process.env.SHADOW_DATABASE_URL = process.env.TEST_DATABASE_URL;

// Signal to graphile-migrate scripts that we're in the tests
process.env.IN_TESTS = "1";
process.env.NODE_ENV = "test";

const opts = {
  stdio: "inherit",
  cwd: process.cwd(),
};

// Reset the test database
execSync("yarn db gm reset --shadow --erase", opts);
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
        name: "jest",
        command: `node --inspect=9876 node_modules/.bin/jest -i ${arg}`,
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
  // Run once, so just run the tests
  spawnSync("jest", ["-i", ...process.argv.slice(2)], opts);
}

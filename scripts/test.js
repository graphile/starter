#!/usr/bin/env node

require("@app/config/env");
const { execSync, spawnSync: rawSpawnSync } = require("child_process");
const concurrently = require("concurrently");

function spawnSync(cmd, args, options) {
  const result = rawSpawnSync(cmd, args, {
    stdio: ["pipe", "inherit", "inherit"],
    env: {
      ...process.env,
      YARN_SILENT: "1",
      npm_config_loglevel: "silent",
    },
    shell: true,
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
}

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
if (delayArg > -1) {
  delaySeconds = parseFloat(cmdArgs[delayArg + 1]);
  if (isNaN(delaySeconds)) {
    throw new Error("Did not get a valid delay argument in seconds.");
  }
  setTimeout(main, delaySeconds * 1000);
} else {
  main();
}

function main() {
  const opts = {
    stdio: "inherit",
    cwd: process.cwd(),
  };

  // Reset the test database
  execSync("yarn db gm reset --shadow --erase", opts);
  execSync("yarn db watch --once --shadow", opts);

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
    // Run once, so just run the tests
    const argsWithoutDelayArg = cmdArgs.filter((arg) => arg !== "--delay");
    spawnSync("jest", ["-i", ...argsWithoutDelayArg], opts);
  }
}

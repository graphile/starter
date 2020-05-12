#!/usr/bin/env node
if (parseInt(process.version.split(".")[0], 10) < 10) {
  throw new Error("This project requires Node.js >= 10.0.0");
}

const fsp = require("fs").promises;
const { runSync } = require("./lib/run");
const dotenv = require("dotenv");
const inquirer = require("inquirer");
const pg = require("pg");
const { withDotenvUpdater, readDotenv } = require("./lib/dotenv");
const { safeRandomString } = require("./lib/random");

// fixes runSync not throwing ENOENT on windows
const platform = require("os").platform();
const yarnCmd = platform === "win32" ? "yarn.cmd" : "yarn";

const projectName = process.argv[2];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function updateDotenv(add, answers) {
  add(
    "GRAPHILE_LICENSE",
    null,
    `\
# If you're supporting PostGraphile's development via Patreon or Graphile
# Store, add your license key from https://store.graphile.com here so you can
# use the Pro plugin - thanks so much!`
  );

  add(
    "NODE_ENV",
    "development",
    `\
# This is a development environment (production wouldn't write envvars to a file)`
  );

  add(
    "ROOT_DATABASE_URL",
    null,
    `\
# Superuser connection string (to a _different_ database), so databases can be dropped/created (may not be necessary in production)`
  );

  add(
    "DATABASE_HOST",
    null,
    `\
# Where's the DB, and who owns it?`
  );

  add("DATABASE_NAME");
  add("DATABASE_OWNER", answers.DATABASE_NAME);
  add("DATABASE_OWNER_PASSWORD", safeRandomString(30));

  add(
    "DATABASE_AUTHENTICATOR",
    `${answers.DATABASE_NAME}_authenticator`,
    `\
# The PostGraphile database user, which has very limited
# privileges, but can switch into the DATABASE_VISITOR role`
  );

  add("DATABASE_AUTHENTICATOR_PASSWORD", safeRandomString(30));

  add(
    "DATABASE_VISITOR",
    `${answers.DATABASE_NAME}_visitor`,
    `\
# Visitor role, cannot be logged into directly`
  );

  add(
    "SECRET",
    safeRandomString(30),
    `\
# This secret is used for signing cookies`
  );

  add(
    "JWT_SECRET",
    safeRandomString(48),
    `\
# This secret is used for signing JWT tokens (we don't use this by default)`
  );

  add(
    "PORT",
    "5678",
    `\
# This port is the one you'll connect to`
  );

  add(
    "ROOT_URL",
    "http://localhost:5678",
    `\
# This is needed any time we use absolute URLs, e.g. for OAuth callback URLs
# IMPORTANT: must NOT end with a slash`
  );

  add(
    "GITHUB_KEY",
    null,
    `\
# To enable login with GitHub, create a GitHub application by visiting
# https://github.com/settings/applications/new and then enter the Client
# ID/Secret below
#
#   Name: PostGraphile Starter (Dev)
#   Homepage URL: http://localhost:5678
#   Authorization callback URL: http://localhost:5678/auth/github/callback
#
# Client ID:`
  );

  add(
    "GITHUB_SECRET",
    null,
    `\
# Client Secret:`
  );

  const nodeVersion = parseInt(
    process.version.replace(/\..*$/, "").replace(/[^0-9]/g, ""),
    10
  );

  add(
    "GRAPHILE_TURBO",
    nodeVersion >= 12 ? "1" : "",
    `\
# Set to 1 only if you're on Node v12 of higher; enables advanced optimisations:`
  );

  if (projectName) {
    add(
      "COMPOSE_PROJECT_NAME",
      projectName,
      `\
# The name of the folder you cloned graphile-starter to (so we can run docker-compose inside a container):`
    );
  }
}

async function main() {
  try {
    const gitStat = await fsp.stat(`${__dirname}/../.git`);
    if (!gitStat || !gitStat.isDirectory()) {
      throw new Error("No .git folder found");
    }
  } catch (e) {
    console.error();
    console.error();
    console.error();
    console.error(
      "ERROR: Graphile Starter must run inside of a git versioned folder. Please run the following:"
    );
    console.error();
    console.error("  git init");
    console.error("  git add .");
    console.error("  git commit -m 'Graphile Starter base'");
    console.error();
    console.error(
      "For more information, read https://github.com/graphile/starter#making-it-yours"
    );
    console.error();
    console.error();
    console.error();
    process.exit(1);
  }
  const config = (await readDotenv()) || {};
  const mergeAnswers = (cb) => (answers) => cb({ ...config, ...answers });
  const questions = [
    {
      type: "input",
      name: "DATABASE_NAME",
      message: "What would you like to call your database?",
      default: "graphile_starter",
      validate: (name) =>
        /^[a-z][a-z0-9_]+$/.test(name)
          ? true
          : "That doesn't look like a good name for a database, try something simpler - just lowercase alphanumeric and underscores",
      when: !config.DATABASE_NAME,
    },
    {
      type: "input",
      name: "DATABASE_HOST",
      message:
        "What's the hostname of your database server (include :port if it's not the default :5432)?",
      default: "localhost",
      when: !("DATABASE_HOST" in config),
    },

    {
      type: "input",
      name: "ROOT_DATABASE_URL",
      message: mergeAnswers(
        (answers) =>
          `Please enter a superuser connection string to the database server (so we can drop/create the '${answers.DATABASE_NAME}' and '${answers.DATABASE_NAME}_shadow' databases) - IMPORTANT: it must not be a connection to the '${answers.DATABASE_NAME}' database itself, instead try 'template1'.`
      ),
      default: mergeAnswers(
        (answers) =>
          `postgres://${
            answers.DATABASE_HOST === "localhost" ? "" : answers.DATABASE_HOST
          }/template1`
      ),
      when: !config.ROOT_DATABASE_URL,
    },
  ];
  const answers = await inquirer.prompt(questions);

  await withDotenvUpdater(answers, (add) =>
    updateDotenv(add, {
      ...config,
      ...answers,
    })
  );

  // And perform setup
  runSync(yarnCmd, ["server", "build"]);
  console.log();
  console.log();
  console.log("____________________________________________________________");
  console.log();
  console.log();
  console.log("✅ Environment file setup success");
  console.log();

  console.log("🚀 The next step is to set up the database, run:");
  console.log();
  console.log("  ",yarnCmd," setup:db");
  console.log()
  console.log(" If you're not using graphile-migrate, then you should run your preferred migration framework now.  This step should also include creating the necessary schemas and roles.  Consult the generated .env file for what is needed.");

  console.log();
  console.log(
    "🙏 Please support our Open Source work: https://graphile.org/sponsor"
  );
  console.log();
  console.log("____________________________________________________________");
  console.log();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

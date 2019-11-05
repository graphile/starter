#!/usr/bin/env node
if (parseInt(process.version.split(".")[0], 10) < 10) {
  throw new Error("This project requires Node.js >= 10.0.0");
}

// Deal with running inside npx
const pathParts = (process.env.PATH || "").split(":");
const isNpx = pathParts[0].includes("/_npx/");
const oldNodePath = process.env.NODE_PATH;
if (isNpx) {
  // We're running in npx; add npx to our NODE_PATH
  process.env.NODE_PATH = require("path").resolve(
    process.cwd(),
    `${pathParts[0]}/../lib/node_modules`
  );
  // Ref: https://github.com/nodejs/node/issues/18229
  require("module").Module._initPaths();
}

const fsp = require("fs").promises;
const { randomBytes } = require("crypto");
const { spawnSync: rawSpawnSync } = require("child_process");
const dotenv = require("dotenv");
const inquirer = require("inquirer");

// fixes spwanSync not throwing ENOENT on windows
const plattform = require("os").platform();
const yarn_cmd = plattform && plattform !== "win32" ? "yarn" : "yarn.cmd";

if (isNpx) {
  // Reset the NODE_PATH dance above
  process.env.NODE_PATH = oldNodePath;
  require("module").Module._initPaths();
}

async function tryMkdir(path) {
  try {
    await fsp.mkdir(path);
  } catch (e) {
    /* noop */
  }
}

const spawnSync = (cmd, args, options) => {
  if (options && options.log) {
    console.log(`Running: {${cmd} ${args && args.join(" ")}}`);
    console.log(options);
  }

  const result = rawSpawnSync(cmd, args, {
    stdio: ["pipe", "inherit", "inherit"],
    ...options,
  });

  if (options && options.log) {
    console.log(`Result: `);
    console.log(result);
  }
  const { error, status, signal, stderr, stdout } = result;

  if (error) {
    throw error;
  }

  if (status) {
    console.log(stdout.toString("utf8"));
    console.log(stderr.toString("utf8"));
    throw new Error(
      `Process exited with status '${status}' (running '${cmd} ${
        args ? args.join(" ") : ""
      }')`
    );
  }

  if (signal) {
    console.log(stdout.toString("utf8"));
    console.log(stderr.toString("utf8"));
    throw new Error(
      `Process exited due to signal '${signal}' (running '${cmd} ${
        args ? args.join(" ") : null
      }')`
    );
  }

  return result;
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const DOTENV_PATH = `${__dirname}/../.env`;

function safeRandomString(length) {
  // Roughly equivalent to shell `openssl rand -base64 30 | tr '+/' '-_'`
  return randomBytes(length)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function readDotenv() {
  let buffer = null;
  try {
    buffer = await fsp.readFile(DOTENV_PATH);
  } catch (e) {
    /* noop */
  }
  const config = buffer ? dotenv.parse(buffer) : null;
  // also read from current env, because docker-compose already populates it
  return { ...config, ...process.env };
}

function encodeDotenvValue(str) {
  if (typeof str !== "string") {
    throw new Error(`'${str}' is not a string`);
  }
  if (str.trim() !== str) {
    // `dotenv` would escape this with single/double quotes but that won't work in docker-compose
    throw new Error(
      "We don't support leading/trailing whitespace in config variables"
    );
  }
  if (str.indexOf("\n") >= 0) {
    // `dotenv` would escape this with single/double quotes and `\n` but that won't work in docker-compose
    throw new Error("We don't support newlines in config variables");
  }
  return str;
}

async function updateDotenv(answers) {
  let data;
  try {
    data = await fsp.readFile(DOTENV_PATH, "utf8");
    // Trim whitespace, and prefix with newline so we can do easier checking later
    data = "\n" + data.trim();
  } catch (e) {
    data = "";
  }

  function add(varName, defaultValue, comment) {
    const SET = `\n${varName}=`;
    const encodedValue = encodeDotenvValue(
      varName in answers ? answers[varName] : defaultValue || ""
    );
    const pos = data.indexOf(SET);
    if (pos >= 0) {
      /* Replace this value with the new value */

      // Where's the next newline (or the end of the file if there is none)
      let nlpos = data.indexOf("\n", pos + 1);
      if (nlpos < 0) {
        nlpos = data.length;
      }

      // Surgical editing
      data =
        data.substr(0, pos + SET.length) + encodedValue + data.substr(nlpos);
    } else {
      /* This value didn't already exist; add it to the end */

      if (comment) {
        data += `\n\n${comment}`;
      }

      data += `${SET}${encodedValue}`;
    }
  }

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

  data = data.trim() + "\n";

  await fsp.writeFile(DOTENV_PATH, data);
}

async function main() {
  const config = (await readDotenv()) || {};
  const mergeAnswers = cb => answers => cb({ ...config, ...answers });
  const questions = [
    {
      type: "input",
      name: "DATABASE_NAME",
      message: "What would you like to call your database?",
      default: "graphile_starter",
      validate: name =>
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
      when: !config.DATABASE_HOST,
    },

    {
      type: "input",
      name: "ROOT_DATABASE_URL",
      message: mergeAnswers(
        answers =>
          `Please enter a superuser connection string to the database server (so we can drop/create the '${answers.DATABASE_NAME}' and '${answers.DATABASE_NAME}_shadow' databases) - IMPORTANT: it must not be a connection to the '${answers.DATABASE_NAME}' database itself, instead try 'template1'.`
      ),
      default: mergeAnswers(
        answers =>
          `postgres://${
            answers.DATABASE_HOST === "localhost" ? "" : answers.DATABASE_HOST
          }/template1`
      ),
      when: !config.ROOT_DATABASE_URL,
    },
  ];
  const answers = await inquirer.prompt(questions);

  await updateDotenv({
    ...config,
    ...answers,
  });

  // And perform setup
  spawnSync(yarn_cmd);
  spawnSync(yarn_cmd, ["server", "build"]);

  // FINALLY we can source our environment
  dotenv.config({ path: `${__dirname}/../.env` }); // Be sure to use dotenv from npx
  require(`${__dirname}/../@app/config/extra`);
  const {
    DATABASE_AUTHENTICATOR,
    DATABASE_AUTHENTICATOR_PASSWORD,
    DATABASE_NAME,
    DATABASE_OWNER,
    DATABASE_OWNER_PASSWORD,
    DATABASE_VISITOR,
    ROOT_DATABASE_URL,
    CONFIRM_DROP,
  } = process.env;

  if (!CONFIRM_DROP) {
    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "CONFIRM",
        default: false,
        message: `We're going to drop (if necessary):

  - database ${DATABASE_NAME}
  - database ${DATABASE_NAME}_shadow
  - database role ${DATABASE_VISITOR} (cascade)
  - database role ${DATABASE_AUTHENTICATOR} (cascade)
  - database role ${DATABASE_OWNER}`,
      },
    ]);
    if (!confirm.CONFIRM) {
      console.error("Confirmation failed; exiting");
      process.exit(1);
    }
  }

  console.log("Installing or reinstalling the roles and database...");
  // setup database via bash script, because spawnSync is not working
  spawnSync("bash", ["./scripts/setup-reset-db"], { log: true });

  //! Not working with docker-compose
  // throws Error ENOENT, but docker-compose is available and works without args
  const psql_cmd = process.env.PSQL || "psql";
  const psqlStandardArgs = ["-X", "-v", "ON_ERROR_STOP=1"];
  const psql = (args, options) => {
    spawnSync(psql_cmd, [...psqlStandardArgs, ...args], options);
  };

  // psql([ROOT_DATABASE_URL], {
  // input: `

  //   console.log(`
  // -- RESET database
  // DROP DATABASE IF EXISTS ${DATABASE_NAME};
  // DROP DATABASE IF EXISTS ${DATABASE_NAME}_shadow;
  // DROP DATABASE IF EXISTS ${DATABASE_NAME}_test;
  // DROP ROLE IF EXISTS ${DATABASE_VISITOR};
  // DROP ROLE IF EXISTS ${DATABASE_AUTHENTICATOR};
  // DROP ROLE IF EXISTS ${DATABASE_OWNER};

  // -- Now to set up the database cleanly:
  // -- Ref: https://devcenter.heroku.com/articles/heroku-postgresql#connection-permissions

  // -- This is the root role for the database
  // CREATE ROLE ${DATABASE_OWNER} WITH LOGIN PASSWORD '${DATABASE_OWNER_PASSWORD}'
  //   -- IMPORTANT: don't grant SUPERUSER in production, we only need this so we can load the watch fixtures!
  //   SUPERUSER;

  // -- This is the no-access role that PostGraphile will run as by default
  // CREATE ROLE ${DATABASE_AUTHENTICATOR} WITH LOGIN PASSWORD '${DATABASE_AUTHENTICATOR_PASSWORD}' NOINHERIT;

  // -- This is the role that PostGraphile will switch to (from ${DATABASE_AUTHENTICATOR}) during a GraphQL request
  // CREATE ROLE ${DATABASE_VISITOR};

  // -- This enables PostGraphile to switch from ${DATABASE_AUTHENTICATOR} to ${DATABASE_VISITOR}
  // GRANT ${DATABASE_VISITOR} TO ${DATABASE_AUTHENTICATOR};
  // `
  //});

  spawnSync(yarn_cmd, ["db", "reset"]);
  spawnSync(yarn_cmd, ["db", "reset", "--shadow"]);

  console.log();
  console.log();
  console.log("____________________________________________________________");
  console.log();
  console.log();
  console.log("✅ Setup success");
  console.log();

  console.log("🚀 To get started, run:");
  console.log();
  console.log("  yarn start");

  console.log();
  console.log(
    "🙏 Please support our Open Source work: https://graphile.org/sponsor"
  );
  console.log();
  console.log("____________________________________________________________");
  console.log();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

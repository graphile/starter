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
  const result = rawSpawnSync(cmd, args, {
    stdio: ["pipe", "inherit", "inherit"],
    ...options,
  });

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
  return buffer ? dotenv.parse(buffer) : null;
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
    "DOCKER_MODE",
    "n",
    `\
# Are we using the Docker mode?`
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
  const defaultAnswers = {
    ...config,
    DOCKER_MODE: config.DOCKER_MODE === "y",
  };
  const mergeAnswers = cb => answers => cb({ ...defaultAnswers, ...answers });
  const questions = [
    {
      type: "confirm",
      name: "DOCKER_MODE",
      message:
        "Would you like to use our (experimental) Docker mode? (Recommended for Windows, or if you don't want PostgreSQL installed locally)",
      default: config.DOCKER_MODE === "y",
      when: !("DOCKER_MODE" in config),
    },

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
      default: mergeAnswers(answers =>
        answers.DOCKER_MODE ? "pg" : config.DATABASE_HOST || "localhost"
      ),
      when: mergeAnswers(
        answers => !answers.DOCKER_MODE && !("DATABASE_HOST" in config)
      ),
    },

    {
      type: "input",
      name: "ROOT_DATABASE_URL",
      message: mergeAnswers(
        answers =>
          `Please enter a superuser connection string to the database server (so we can drop/create the '${answers.DATABASE_NAME}' and '${answers.DATABASE_NAME}_shadow' databases) - IMPORTANT: it must not be a connection to the '${answers.DATABASE_NAME}' database itself, instead try 'template1'.`
      ),
      default: mergeAnswers(answers =>
        answers.DOCKER_MODE
          ? "postgres://postgres@pg/template1"
          : config.ROOT_DATABASE_URL ||
            `postgres://${
              answers.DATABASE_HOST === "localhost" ? "" : answers.DATABASE_HOST
            }/template1`
      ),
      when: mergeAnswers(
        answers => !answers.DOCKER_MODE && !config.ROOT_DATABASE_URL
      ),
    },
  ];
  const rawAnswers = await inquirer.prompt(questions);

  const dockerMode = config.DOCKER_MODE
    ? config.DOCKER_MODE === "y"
    : rawAnswers.DOCKER_MODE;
  const answers = {
    ...(dockerMode
      ? {
          DATABASE_HOST: "pg",
          ROOT_DATABASE_URL: "postgres://postgres@pg/template1",
        }
      : null),
    ...rawAnswers,

    // Convert boolean to string
    DOCKER_MODE: dockerMode ? "y" : "n",
  };

  await updateDotenv({
    ...config,
    ...answers,
  });

  // And perform setup

  if (dockerMode) {
    // Need to create these folders as owned by us before Docker starts
    await tryMkdir(`${__dirname}/../.docker`);
    await tryMkdir(`${__dirname}/../.docker/postgres_data`);
    await tryMkdir(`${__dirname}/../.docker/node_modules`);
    await tryMkdir(`${__dirname}/../.docker/node_modules_client`);
    await tryMkdir(`${__dirname}/../.docker/node_modules_db`);
    await tryMkdir(`${__dirname}/../.docker/node_modules_e2e`);
    await tryMkdir(`${__dirname}/../.docker/node_modules_server`);
    await tryMkdir(`${__dirname}/../.docker/node_modules_worker`);
    spawnSync("docker-compose", [
      "-f",
      "docker-compose.builder.yml",
      "run",
      `--user=${process.env.UID}`,
      "--rm",
      "install",
    ]);
    spawnSync("docker-compose", [
      "-f",
      "docker-compose.builder.yml",
      "run",
      `--user=${process.env.UID}`,
      "--rm",
      "server-src-build",
    ]);
  } else {
    spawnSync("yarn");
    spawnSync("yarn", ["server", "build"]);
  }

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
  } = process.env;

  console.log(process.env.DATABASE_URL);

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

  console.log("Installing or reinstalling the roles and database...");
  const psqlStandardArgs = ["-X", "-v", "ON_ERROR_STOP=1"];
  const psql = dockerMode
    ? (args, options) =>
        spawnSync(
          "docker-compose",
          [
            "run",
            `--user=${process.env.UID}`,
            "--rm",
            "pg",
            "psql",
            ...psqlStandardArgs,
            ...args,
          ],
          options
        )
    : (args, options) =>
        spawnSync("psql", [...psqlStandardArgs, ...args], options);
  if (dockerMode) {
    spawnSync("docker-compose", ["down"]);
    spawnSync("docker-compose", ["up", "-d", "pg"]);
    process.once("exit", () => {
      spawnSync("docker-compose", ["down"]);
    });

    // Wait for PostgreSQL to come up
    let attempts = 0;
    while (true) {
      try {
        psql([ROOT_DATABASE_URL, "-c", 'select true as "Connection test";'], {
          stdio: "ignore",
        });
        break;
      } catch (e) {
        attempts++;
        if (attempts <= 30) {
          console.log(`Database is not ready yet (attempt ${attempts})`);
        } else {
          console.log(`Database never came up, aborting :(`);
          process.exit(1);
        }
        await sleep(1000);
      }
    }
  }

  psql([ROOT_DATABASE_URL], {
    input: `
-- RESET database
DROP DATABASE IF EXISTS ${DATABASE_NAME};
DROP DATABASE IF EXISTS ${DATABASE_NAME}_shadow;
DROP DATABASE IF EXISTS ${DATABASE_NAME}_test;
DROP ROLE IF EXISTS ${DATABASE_VISITOR};
DROP ROLE IF EXISTS ${DATABASE_AUTHENTICATOR};
DROP ROLE IF EXISTS ${DATABASE_OWNER};

-- Now to set up the database cleanly:
-- Ref: https://devcenter.heroku.com/articles/heroku-postgresql#connection-permissions

-- This is the root role for the database
CREATE ROLE ${DATABASE_OWNER} WITH LOGIN PASSWORD '${DATABASE_OWNER_PASSWORD}'
  -- IMPORTANT: don't grant SUPERUSER in production, we only need this so we can load the watch fixtures!
  SUPERUSER;

-- This is the no-access role that PostGraphile will run as by default
CREATE ROLE ${DATABASE_AUTHENTICATOR} WITH LOGIN PASSWORD '${DATABASE_AUTHENTICATOR_PASSWORD}' NOINHERIT;

-- This is the role that PostGraphile will switch to (from ${DATABASE_AUTHENTICATOR}) during a GraphQL request
CREATE ROLE ${DATABASE_VISITOR};

-- This enables PostGraphile to switch from ${DATABASE_AUTHENTICATOR} to ${DATABASE_VISITOR}
GRANT ${DATABASE_VISITOR} TO ${DATABASE_AUTHENTICATOR};
`,
  });

  if (dockerMode) {
    spawnSync("docker-compose", [
      "-f",
      "docker-compose.builder.yml",
      "run",
      `--user=${process.env.UID}`,
      "--rm",
      "db-reset",
    ]);
  } else {
    spawnSync("yarn", ["db", "reset"]);
    spawnSync("yarn", ["db", "reset", "--shadow"]);
  }

  if (dockerMode) {
    spawnSync("docker-compose", ["down"]);
  }

  console.log();
  console.log();
  console.log("____________________________________________________________");
  console.log();
  console.log();
  console.log("✅ Setup success");
  console.log();

  console.log("🚀 To get started, run:");
  console.log();
  if (dockerMode) {
    console.log("  export UID; docker-compose up");
  } else {
    console.log("  yarn start");
  }
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

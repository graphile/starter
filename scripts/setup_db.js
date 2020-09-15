#!/usr/bin/env node
const {
  yarnCmd,
  runMain,
  checkGit,
  outro,
  runSync,
  projectName,
} = require("./_setup_utils");
const inquirer = require("inquirer");
const dotenv = require("dotenv");
const pg = require("pg");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

runMain(async () => {
  await checkGit();

  // Ensure server build has been run
  runSync(yarnCmd, ["server", "build"]);

  // Source our environment
  dotenv.config({ path: `${__dirname}/../.env` });
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
  const pgPool = new pg.Pool({
    connectionString: ROOT_DATABASE_URL,
  });

  pgPool.on("error", (err) => {
    // Ignore
    console.log(
      "An error occurred whilst trying to talk to the database: " + err.message
    );
  });

  // Wait for PostgreSQL to come up
  let attempts = 0;
  while (true) {
    try {
      await pgPool.query('select true as "Connection test";');
      break;
    } catch (e) {
      if (e.code === "28P01") {
        throw e;
      }
      attempts++;
      if (attempts <= 30) {
        console.log(
          `Database is not ready yet (attempt ${attempts}): ${e.message}`
        );
      } else {
        console.log(`Database never came up, aborting :(`);
        process.exit(1);
      }
      await sleep(1000);
    }
  }

  const client = await pgPool.connect();
  try {
    // RESET database
    await client.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME};`);
    await client.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}_shadow;`);
    await client.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}_test;`);
    await client.query(`DROP ROLE IF EXISTS ${DATABASE_VISITOR};`);
    await client.query(`DROP ROLE IF EXISTS ${DATABASE_AUTHENTICATOR};`);
    await client.query(`DROP ROLE IF EXISTS ${DATABASE_OWNER};`);

    // Now to set up the database cleanly:
    // Ref: https://devcenter.heroku.com/articles/heroku-postgresql#connection-permissions

    // This is the root role for the database`);
    await client.query(
      // IMPORTANT: don't grant SUPERUSER in production, we only need this so we can load the watch fixtures!
      `CREATE ROLE ${DATABASE_OWNER} WITH LOGIN PASSWORD '${DATABASE_OWNER_PASSWORD}' SUPERUSER;`
    );

    // This is the no-access role that PostGraphile will run as by default`);
    await client.query(
      `CREATE ROLE ${DATABASE_AUTHENTICATOR} WITH LOGIN PASSWORD '${DATABASE_AUTHENTICATOR_PASSWORD}' NOINHERIT;`
    );

    // This is the role that PostGraphile will switch to (from ${DATABASE_AUTHENTICATOR}) during a GraphQL request
    await client.query(`CREATE ROLE ${DATABASE_VISITOR};`);

    // This enables PostGraphile to switch from ${DATABASE_AUTHENTICATOR} to ${DATABASE_VISITOR}
    await client.query(
      `GRANT ${DATABASE_VISITOR} TO ${DATABASE_AUTHENTICATOR};`
    );
  } finally {
    await client.release();
  }
  await pgPool.end();

  runSync(yarnCmd, ["db", "reset", "--erase"]);
  runSync(yarnCmd, ["db", "reset", "--shadow", "--erase"]);

  outro(`\
✅ Setup success

🚀 To get started, run:

${
  projectName
    ? // Probably Docker setup
      "  export UID; docker-compose up server"
    : `  ${yarnCmd} start`
}`);
});

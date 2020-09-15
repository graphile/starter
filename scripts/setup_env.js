#!/usr/bin/env node
const {
  yarnCmd,
  runMain,
  checkGit,
  outro,
  withDotenvUpdater,
  updateDotenv,
  readDotenv,
  runSync,
} = require("./_setup_utils");
const inquirer = require("inquirer");

runMain(async () => {
  await checkGit();
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

  if (process.argv[2] === "auto") {
    // We're advancing automatically
    console.log(`\
✅ Environment file setup success`);
  } else {
    outro(`\
✅ Environment file setup success

🚀 The next step is to set up the database, run:

  ${yarnCmd} setup:db

If you're not using graphile-migrate, then you should run your preferred migration framework now.  This step should also include creating the necessary schemas and roles.  Consult the generated .env file for what is needed.`);
  }
});

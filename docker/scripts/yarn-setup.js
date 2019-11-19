const { execSync, spawnSync } = require("child_process");
const { basename, dirname, resolve } = require("path");

const options = { stdio: "inherit" };

// The `docker-compose` project name defaults to the directory name containing
// `docker-compose.yml`, which is the root folder of our project. Let's call
// that 'ROOT'. We're in ROOT/docker/scripts and we want to get the name of
// ROOT:
const projectName = basename(dirname(dirname(resolve(__dirname))));

execSync("yarn down", options);
execSync("yarn db:up", options);
spawnSync(
  "yarn",
  ["compose", "run", "server", "yarn", "setup", projectName],
  options
);

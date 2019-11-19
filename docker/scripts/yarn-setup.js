const { execSync, spawnSync } = require("child_process");
const { basename, dirname, resolve } = require("path");

let options = { stdio: "inherit" };

// The `docker-compose` project name defaults to the directory name containing
// `docker-compose.yml`, which is the root folder of our project. Let's call
// that 'ROOT'. We're in ROOT/docker/scripts and we want to get the name of
// ROOT:
const projectName = basename(dirname(dirname(resolve(__dirname))));

// fixes spawnSync not throwing ENOENT on windows
const platform = require("os").platform();
const yarnCmd = platform === "win32" ? "yarn.cmd" : "yarn";
execSync(`${yarnCmd} down`, options);
execSync(`${yarnCmd} db:up`, options);
options = { windowsHide: true, ...options };
spawnSync(
  yarnCmd,
  ["compose", "run", "server", "yarn", "setup", projectName],
  options
);

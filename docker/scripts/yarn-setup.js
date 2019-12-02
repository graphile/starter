const { spawnSync: baseSpawnSync } = require("child_process");
const { basename, dirname, resolve } = require("path");
const platform = require("os").platform();

if (platform !== "win32" && !process.env.UID) {
  console.error(
    "You should run `export UID` before running 'yarn docker setup' otherwise you may end up with permissions issues."
  );
  process.exit(1);
}

function spawnSync(command, args, options = {}) {
  const result = baseSpawnSync(command, args, {
    stdio: "inherit",
    windowsHide: true,
    ...options,
  });
  if (result.status) {
    process.exit(result.status);
  }
  if (result.signal) {
    process.exit(1);
  }
}

// The `docker-compose` project name defaults to the directory name containing
// `docker-compose.yml`, which is the root folder of our project. Let's call
// that 'ROOT'. We're in ROOT/docker/scripts and we want to get the name of
// ROOT:
const projectName = basename(dirname(dirname(resolve(__dirname))));

// On Windows we must run 'yarn.cmd' rather than 'yarn'
const yarnCmd = platform === "win32" ? "yarn.cmd" : "yarn";

spawnSync(yarnCmd, ["down"]);
spawnSync(yarnCmd, ["db:up"]);

// Fix permissions
spawnSync(yarnCmd, [
  "compose",
  "run",
  "server",
  "sudo",
  "bash",
  "-c",
  "chmod o+rwx /var/run/docker.sock && chown -R node /work/node_modules /work/@app/*/node_modules",
]);

// Run setup as normal
spawnSync(yarnCmd, ["compose", "run", "server", "yarn", "setup", projectName]);

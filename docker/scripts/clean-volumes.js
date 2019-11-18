#!/usr/bin/env node
const { execSync } = require("child_process");
const { basename, dirname, resolve } = require("path");

const projectName = basename(dirname(resolve(__dirname, "..")));

try {
  execSync(
    `docker volume rm ${projectName}_db-volume ${projectName}_node_modules-volume ${projectName}_vscode-extensions ${projectName}_devcontainer_db-volume ${projectName}_devcontainer_node_modules-volume ${projectName}_devcontainer_vscode-extensions`,
    { stdio: "inherit" }
  );
} catch (e) {
  /* noop */
}

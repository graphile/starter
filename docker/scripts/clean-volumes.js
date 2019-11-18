#!/usr/bin/env node
const { execSync } = require("child_process");

try {
  execSync(
    "docker volume rm starterapp_db-volume starterapp_node_modules-volume starterapp_vscode-extensions starterapp_devcontainer_db-volume starter_devcontainer_node_modules-volume starterapp_devcontainer_vscode-extensions",
    { stdio: "inherit" }
  );
} catch (e) {
  /* noop */
}

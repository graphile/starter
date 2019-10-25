#!/usr/bin/env node

try {
  const { execSync } = require("child_process");

  const opts = {
    stdio: "inherit",
    cwd: process.cwd(),
  };

  // TODO: make it all js scripting
  // deletes all docker volumes
  execSync(
    'cd .. && bash -c "docker volume rm ${PWD##*/}_devcontainer_db-volume  ${PWD##*/}_devcontainer_node_modules-volume ${PWD##*/}_devcontainer_vscode-extensions || true"',
    opts
  );
} catch (err) {
  console.error(err);
}

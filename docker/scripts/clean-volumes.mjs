#!/usr/bin/env zx

const { basename, dirname, resolve } = path;

const projectName = basename(dirname(resolve(__dirname, ".."))).replace(
  /[^a-z0-9]/g,
  ""
);

try {
  await $`docker volume rm ${projectName}_vscode-extensions ${projectName}_devcontainer_db-volume ${projectName}_devcontainer_node_modules-volume ${projectName}_devcontainer_vscode-extensions`;
} catch (e) {
  /* noop */
}

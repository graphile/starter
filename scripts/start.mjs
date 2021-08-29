#!/usr/bin/env zx

import { $, fs } from "zx";

void (async function () {
  try {
    const ENVFILE = `${__dirname}/../.env`;
    if (!fs.existsSync(ENVFILE)) {
      console.error("🛠️  Please run 'yarn setup' before running 'yarn start'");
      await $`exit 1`;
    }

    await $`set -a`;
    await $`source ${ENVFILE}`;
    await $`YARN_SILENT=1`;
    await $`npm_config_loglevel="silent"`;
    await $`set +a`;
    await $`yarn dev`;
  } catch (error) {
    console.error(error);
  }
})();

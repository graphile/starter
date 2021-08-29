#!/usr/bin/env node

import { $ } from "zx";

void (async function () {
  try {
    await $`rm -rf ${__dirname}/../@app/*/dist`;
    await $`rm -rf ${__dirname}/../@app/*/tsconfig.tsbuildinfo`;
    await $`rm -rf ${__dirname}/../@app/client/.next`;
  } catch (e) {
    console.error("Failed to clean up");
    console.error(e);
  }
})();

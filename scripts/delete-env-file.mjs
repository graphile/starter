#!/usr/bin/env node

import { fs } from "zx";

void (async function () {
  try {
    await fs.unlink(`${__dirname}/../.env`);
  } catch (e) {
    /* NOOP */
  }
})();

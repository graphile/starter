#!/usr/bin/env node
const fs = require("fs");

try {
  fs.unlinkSync(`${__dirname}/../.env`);
} catch (e) {
  /* NOOP */
}

#!/usr/bin/env node
const fs = require("fs");

if (!fs.existsSync(`${__dirname}/../.env`)) {
  console.error("🛠️  Please run 'yarn setup' before running 'yarn start'");
  process.exit(1);
}

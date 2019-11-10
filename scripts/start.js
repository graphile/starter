#!/usr/bin/env node
const fs = require("fs");
const { spawn } = require("child_process");

const ENVFILE = `${__dirname}/../.env`;

if (!fs.existsSync(ENVFILE)) {
  console.error("🛠️  Please run 'yarn setup' before running 'yarn start'");
  process.exit(1);
}

spawn("yarn", ["dev"], { stdio: "inherit" });

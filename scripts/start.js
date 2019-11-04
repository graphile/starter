#!/usr/bin/env node
const fs = require("fs");
const { spawn } = require("child_process");

const ENVFILE = `${__dirname}/../.env`;

if (!fs.existsSync(ENVFILE)) {
  console.error("🛠️  Please run 'yarn setup' before running 'yarn start'");
  process.exit(1);
}
const content = "\n" + fs.readFileSync(ENVFILE, "utf8");
const matches = content.match(/\nDOCKER_MODE=(.*)/);
if (matches && matches[1] === "y") {
  console.error();
  console.error();
  console.error(
    "This repo was configured for docker mode, it cannot be started with yarn start - instead, try:"
  );
  console.error();
  console.error("  export UID; docker-compose up");
  console.error();
  console.error();
  process.exit(1);
} else {
  spawn("yarn", ["dev"], { stdio: "inherit" });
}

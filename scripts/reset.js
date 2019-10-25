#!/usr/bin/env node

const fs = require("fs");
const path = "./.env";

try {
  if (fs.existsSync(path)) {
    const { execSync } = require("child_process");

    const opts = {
      stdio: "inherit",
      cwd: process.cwd(),
    };

    // deletes config in .env
    execSync(`rm ${path}`, opts);
  }
} catch (err) {
  console.error(err);
}

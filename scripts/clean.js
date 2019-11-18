#!/usr/bin/env node
const rimraf = require("rimraf");

rimraf.sync(`${__dirname}/../@app/*/dist`);
rimraf.sync(`${__dirname}/../@app/client/.next`);

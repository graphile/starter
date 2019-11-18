#!/usr/bin/env node
const rimraf = require("rimraf");

rimraf.sync("@app/*/dist");
rimraf.sync("@app/client/.next");

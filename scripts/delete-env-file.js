#!/usr/bin/env node
const rimraf = require("rimraf");

rimraf.sync(`${__dirname}/../.env`);

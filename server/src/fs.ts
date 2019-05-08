/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import { promisify } from "util";
import * as fs from "fs";

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);

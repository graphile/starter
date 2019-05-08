/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import * as morgan from "morgan";
import { Application } from "express";

const isDev = process.env.NODE_ENV === "development";

export default (app: Application) => {
  if (isDev) {
    // To enable logging on development, uncomment the next line:
    // app.use(morgan("tiny"));
  } else {
    app.use(morgan(isDev ? "tiny" : "combined"));
  }
};

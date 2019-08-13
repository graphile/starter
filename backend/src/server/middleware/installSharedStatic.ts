/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import { static as staticMiddleware, Application } from "express";

export default (app: Application) => {
  app.use(staticMiddleware(`${__dirname}/../public`));
};

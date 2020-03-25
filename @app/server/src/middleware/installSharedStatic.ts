import { Express, static as staticMiddleware } from "express";

export default (app: Express) => {
  app.use(staticMiddleware(`${__dirname}/../../public`));
};

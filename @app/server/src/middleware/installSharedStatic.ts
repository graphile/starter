import { static as staticMiddleware, Application } from "express";

export default (app: Application) => {
  app.use(staticMiddleware(`${__dirname}/../../public`));
};

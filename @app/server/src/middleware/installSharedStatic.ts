import { static as staticMiddleware, Express } from "express";

export default (app: Express) => {
  app.use(staticMiddleware(`${__dirname}/../../public`));
};

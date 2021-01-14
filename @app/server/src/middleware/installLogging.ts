import { isDev } from "@app/config";
import { Express } from "express";
import morgan from "morgan";

export default (app: Express) => {
  if (isDev) {
    // To enable logging on development, uncomment the next line:
    // app.use(morgan("tiny"));
  } else {
    app.use(morgan(isDev ? "tiny" : "combined"));
  }
};

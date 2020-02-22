import { Express } from "express";
import morgan from "morgan";

const isDev = process.env.NODE_ENV === "development";

export default (app: Express) => {
  if (isDev) {
    // To enable logging on development, uncomment the next line:
    // app.use(morgan("tiny"));
  } else {
    app.use(morgan(isDev ? "tiny" : "combined"));
  }
};

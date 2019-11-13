import morgan from "morgan";
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

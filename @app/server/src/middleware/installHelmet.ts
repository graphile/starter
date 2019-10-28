import { Application } from "express";
import * as helmet from "helmet";

export default function installHelmet(app: Application) {
  app.use(helmet());
}

import { Application } from "express";
import helmet from "helmet";

export default function installHelmet(app: Application) {
  app.use(helmet());
}

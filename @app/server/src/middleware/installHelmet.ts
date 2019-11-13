import { Express } from "express";
import helmet from "helmet";

export default function installHelmet(app: Express) {
  app.use(helmet());
}

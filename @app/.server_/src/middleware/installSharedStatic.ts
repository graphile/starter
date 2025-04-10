import { Express, static as staticMiddleware } from "express";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get the current directory from the module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default (app: Express) => {
  app.use(staticMiddleware(`${__dirname}/../../../public`));
};

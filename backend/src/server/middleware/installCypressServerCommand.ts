import { Application, RequestHandler } from "express";
import { urlencoded } from "body-parser";
import { Pool } from "pg";

export default (app: Application) => {
  if (!["test", "development"].includes(process.env.NODE_ENV || "")) {
    throw new Error("This code must not run in production");
  }
  const safeToRun = process.env.ENABLE_CYPRESS_COMMANDS === "1";
  const rootPgPool: Pool = app.get("rootPgPool");
  const handleCypressServerCommand: RequestHandler = async (req, res, next) => {
    if (!safeToRun) {
      console.error(
        "/cypressServerCommand denied because ENABLE_CYPRESS_COMMANDS is not set."
      );
      // Pretend like nothing happened
      next();
      return;
    }
    try {
      const { query } = req;
      if (!query) {
        throw new Error("Query not specified");
      }
      const result = await runCommand(rootPgPool, query);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };
  app.get(
    "/cypressServerCommand",
    urlencoded({ extended: false }),
    handleCypressServerCommand
  );
};

async function runCommand(
  rootPgPool: Pool,
  query: { [key: string]: string }
): Promise<object> {
  const { command } = query;
  if (!command) {
    throw new Error("Command not specified");
  } else if (command === "clearTestUsers") {
    await rootPgPool.query(
      "delete from app_public.users where username like 'testuser%'"
    );
    return { success: true };
  } else {
    throw new Error(`Command '${command}' not understood.`);
  }
}

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
      const { command: rawCommand, payload: rawPayload } = query;
      if (!rawCommand) {
        throw new Error("Command not specified");
      }
      const command = String(rawCommand);
      const payload = rawPayload ? JSON.parse(rawPayload) : null;
      const result = await runCommand(rootPgPool, command, payload);
      res.json(result);
    } catch (e) {
      res.status(500).json({
        error: {
          message: e.message,
          stack: e.stack,
        },
      });
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
  command: string,
  payload?: { [key: string]: any }
): Promise<object> {
  if (command === "clearTestUsers") {
    await rootPgPool.query(
      "delete from app_public.users where username like 'testuser%'"
    );
    return { success: true };
  } else if (command === "createUser") {
    if (!payload) {
      throw new Error("Payload required");
    }
    const {
      username = "testuser",
      email = `${username}@example.com`,
      verified = false,
      name = username,
      avatarUrl = null,
      password = "TestUserPassword",
    } = payload;
    if (!username.startsWith("testuser")) {
      throw new Error("Test user usernames may only start with 'testuser'");
    }
    const {
      rows: [user],
    } = await rootPgPool.query(
      `SELECT * FROM app_private.really_create_user(
        username := $1,
        email := $2,
        email_is_verified := $3,
        name := $4,
        avatar_url := $5,
        password := $6
      )`,
      [username, email, verified, name, avatarUrl, password]
    );

    let verificationToken: string | null = null;
    let userEmailId: number;
    const {
      rows: [userEmailSecrets],
    } = await rootPgPool.query(
      `
        select *
        from app_private.user_email_secrets
        where user_email_id = (
          select id
          from app_public.user_emails
          where email = $1
          order by id desc
          limit 1
        )
      `,
      [email]
    );
    userEmailId = userEmailSecrets.user_email_id;
    if (!verified) {
      verificationToken = userEmailSecrets.verification_token;
    }

    return { user, userEmailId, verificationToken };
  } else {
    throw new Error(`Command '${command}' not understood.`);
  }
}

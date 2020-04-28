import { getTasks, run, runMigrations } from "graphile-worker";
import { Pool } from "pg";
import { parse } from "pg-connection-string";

/*
 * Normally you'd use the CLI, but we need to use pg-connection-string >= 2.1.0,
 * and pg only uses 0.1.3 so we have to drop to library mode.
 */

async function main() {
  const pgPool = new Pool(parse(process.env.DATABASE_URL!) as any);
  try {
    const options = { pgPool };
    const schemaOnly = process.argv.includes("--schema-only");
    if (schemaOnly) {
      return await runMigrations(options);
    }
    const watch = process.argv.includes("--watch");
    const { tasks, release } = await getTasks(
      options,
      `${__dirname}/tasks`,
      watch
    );
    try {
      const { promise } = await run({
        ...options,
        taskList: tasks,
      });
      return await promise;
    } finally {
      release();
    }
  } finally {
    pgPool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

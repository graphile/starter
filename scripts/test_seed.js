const fs = require("fs");
const pg = require("pg");
const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);

async function main() {
  const pgPool = new pg.Pool({ connectionString: process.env.GM_DBURL });
  try {
    await pgPool.query(
      "drop trigger _200_make_first_user_admin on app_public.users;"
    );
    await pgPool.query("delete from graphile_worker.jobs;");
    await writeFile(
      "migrations/__tests__/.jest.watch.hack.json",
      JSON.stringify({
        ts: Date.now(),
      })
    );
  } finally {
    await pgPool.end();
  }
}

if (process.env.IN_TESTS === "1") {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}

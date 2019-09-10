const fs = require("fs");
const pg = require("pg");
const { promisify } = require("util");
const utimes = promisify(fs.utimes);
const close = promisify(fs.close);
const open = promisify(fs.open);

async function touch(filepath) {
  try {
    const now = new Date();
    await utimes(filepath, now, now);
  } catch (err) {
    const fd = await open(filepath, "w");
    await close(fd);
  }
}

async function main() {
  const pgPool = new pg.Pool({ connectionString: process.env.GM_DBURL });
  try {
    await pgPool.query(
      "drop trigger _200_make_first_user_admin on app_public.users;"
    );
    await pgPool.query("delete from graphile_worker.jobs;");
    await touch("migrations/__tests__/helpers.ts");
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

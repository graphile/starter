const pg = require("pg");

async function main() {
  const pgPool = new pg.Pool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_OWNER,
    password: process.env.DATABASE_OWNER_PASSWORD,
    database: process.env.DATABASE_NAME,
  });
  try {
    await pgPool.query(
      `update app_public.users set is_admin = $2 where username = $1;`,
      [process.argv[2], process.argv[3]]
    );
    const res = await pgPool.query(
      `select username, is_admin from app_public.users where username = $1;`,
      [process.argv[2]]
    );
    console.log(res.rows);
  } finally {
    await pgPool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

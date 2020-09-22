const { spawn } = require( 'child_process' );

const inTests = process.env.IN_TESTS;
if (!inTests) {
  const connectionString = process.env.GM_DBURL;
  if (!connectionString) {
    throw new Error("This script should only be ran from inside graphile-migrate");
  }

  spawn(process.env.PG_DUMP || 'pg_dump', [
      "--no-sync",
      "--schema-only",
      "--no-owner",
      "--exclude-schema=graphile_migrate",
      "--exclude-schema=graphile_worker",
      "--file=../../data/schema.sql",
      `"${connectionString}"`
    ], {
      stdio: "inherit",
      env: {
        ...process.env,
      },
      shell: true
  });
}

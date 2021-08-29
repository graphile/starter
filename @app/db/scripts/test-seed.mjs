#!/usr/bin/env zx

import pg from "pg";
import { fs } from "zx";

const { Pool } = pg;

if (process.env.IN_TESTS !== "1") {
  process.exit(0);
}

async function main() {
  const connectionString = process.env.GM_DBURL;
  if (!connectionString) {
    throw new Error("GM_DBURL not set!");
  }
  const pgPool = new Pool({ connectionString });
  try {
    await pgPool.query("delete from graphile_worker.jobs;");
    await fs.writeFile(
      `${__dirname}/../__tests__/jest.watch.hack.ts`,
      `export const ts = ${Date.now()};\n`
    );
  } finally {
    await pgPool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

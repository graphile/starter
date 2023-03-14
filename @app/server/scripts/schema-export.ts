import { writeFileSync } from "fs";
import { lexicographicSortSchema, printSchema } from "graphql";
import { Pool } from "pg";
import { makeSchema } from "postgraphile";

import { getPreset } from "../src/graphile.config";

async function main() {
  const rootPgPool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });
  try {
    const { schema } = await makeSchema(
      getPreset({ rootPgPool, authPgPool: rootPgPool })
    );

    const sorted = lexicographicSortSchema(schema);
    writeFileSync(
      `${__dirname}/../../../data/schema.graphql`,
      printSchema(sorted)
    );
    console.log("GraphQL schema exported");
  } finally {
    rootPgPool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

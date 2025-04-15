import { writeFileSync } from "fs";
import { lexicographicSortSchema, printSchema } from "graphql";
import pg from "pg";
const { Pool } = pg;
import { createPostGraphileSchema } from "postgraphile";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { getPostGraphileOptions } from "../src/graphile-config.js";

// Get the current directory from the module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const rootPgPool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });
  try {
    const schema = await createPostGraphileSchema(
      process.env.AUTH_DATABASE_URL!,
      "app_public",
      getPostGraphileOptions({ rootPgPool })
    );
    const sorted = lexicographicSortSchema(schema);
    writeFileSync(
      `${__dirname}/../../../../data/schema.graphql`,
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

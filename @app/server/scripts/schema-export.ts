import { writeFileSync } from "fs";
import { printSchema } from "graphql";
import { Pool } from "pg";
import { createPostGraphileSchema } from "postgraphile";

import { getPostGraphileOptions } from "../src/middleware/installPostGraphile";

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
    writeFileSync(
      `${__dirname}/../../../data/schema.graphql`,
      printSchema(schema)
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

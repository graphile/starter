import { writeFileSync } from "fs";
import { lexicographicSortSchema, printSchema } from "graphql";
import { Pool } from "pg";
import { makeSchema } from "postgraphile";

import { getPreset } from "../src/graphile.config";

async function main() {
  const authPgPool = new Pool({
    connectionString: process.env.AUTH_DATABASE_URL!,
  });
  const preset = {
    extends: [getPreset({ authPgPool })],
    schema: {
      // Turn off built-in schema exporting
      exportSchemaSDLPath: undefined,
      exportSchemaIntrospectionResultPath: undefined,
    },
  };

  try {
    const { schema } = await makeSchema(preset);
    const sorted = lexicographicSortSchema(schema);
    writeFileSync(
      `${__dirname}/../../../data/schema.graphql`,
      printSchema(sorted) + "\n"
    );
    console.log("GraphQL schema exported");
  } finally {
    authPgPool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

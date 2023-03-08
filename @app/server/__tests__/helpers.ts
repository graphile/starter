import {
  ExecutionArgs,
  ExecutionResult,
  GraphQLSchema,
  parse,
  validate,
} from "graphql";
import { Pool, PoolClient } from "pg";
import { PostGraphileInstance, postgraphile } from "postgraphile";
import { hookArgs, execute } from "grafast";
import { makeWithPgClientViaPgClientAlreadyInTransaction } from "@dataplan/pg/adaptors/pg";

import {
  createSession,
  createUsers,
  poolFromUrl,
} from "../../__tests__/helpers";
import { getPreset } from "../src/graphile.config";

export * from "../../__tests__/helpers";

const MockReq = require("mock-req");

export async function createUserAndLogIn() {
  const pool = poolFromUrl(process.env.TEST_DATABASE_URL!);
  const client = await pool.connect();
  try {
    const [user] = await createUsers(pool, 1, true);
    const session = await createSession(pool, user.id);
    return { user, session };
  } finally {
    client.release();
  }
}

let known: Record<string, { counter: number; values: Map<unknown, string> }> =
  {};
beforeEach(() => {
  known = {};
});
/*
 * This function replaces values that are expected to change with static
 * placeholders so that our snapshot testing doesn't throw an error
 * every time we run the tests because time has ticked on in it's inevitable
 * march toward the future.
 */
export function sanitize(json: any): any {
  /* This allows us to maintain stable references whilst dealing with variable values */
  function mask(value: unknown, type: string) {
    if (!known[type]) {
      known[type] = { counter: 0, values: new Map() };
    }
    const o = known[type];
    if (!o.values.has(value)) {
      o.values.set(value, `[${type}-${++o.counter}]`);
    }
    return o.values.get(value);
  }

  if (Array.isArray(json)) {
    return json.map((val) => sanitize(val));
  } else if (json && typeof json === "object") {
    const result = { ...json };
    for (const k in result) {
      if (k === "nodeId" && typeof result[k] === "string") {
        result[k] = mask(result[k], "nodeId");
      } else if (
        k === "id" ||
        k === "uuid" ||
        (k.endsWith("Id") &&
          (typeof json[k] === "number" || typeof json[k] === "string")) ||
        (k.endsWith("Uuid") && typeof k === "string")
      ) {
        result[k] = mask(result[k], "id");
      } else if (
        (k.endsWith("At") || k === "datetime") &&
        typeof json[k] === "string"
      ) {
        result[k] = mask(result[k], "timestamp");
      } else if (
        k.match(/^deleted[A-Za-z0-9]+Id$/) &&
        typeof json[k] === "string"
      ) {
        result[k] = mask(result[k], "nodeId");
      } else if (k === "email" && typeof json[k] === "string") {
        result[k] = mask(result[k], "email");
      } else if (k === "username" && typeof json[k] === "string") {
        result[k] = mask(result[k], "username");
      } else {
        result[k] = sanitize(json[k]);
      }
    }
    return result;
  } else {
    return json;
  }
}

// Contains the PostGraphile schema and rootPgPool
interface ICtx {
  rootPgPool: Pool;
  pgl: PostGraphileInstance;
  schema: GraphQLSchema;
}
let ctx: ICtx | null = null;

export const setup = async () => {
  const rootPgPool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
  });

  const preset = getPreset({ rootPgPool, authPgPool: rootPgPool });
  const pgl = postgraphile(preset);
  const schema = await pgl.getSchema();

  // Store the context
  ctx = {
    rootPgPool,
    pgl,
    schema,
  };
};

export const teardown = async () => {
  try {
    if (!ctx) {
      return null;
    }
    const { rootPgPool } = ctx;
    ctx = null;
    rootPgPool.end();
    return null;
  } catch (e: any) {
    console.error(e);
    return null;
  }
};

export const runGraphQLQuery = async function runGraphQLQuery(
  query: string, // The GraphQL query string
  variables: { [key: string]: any } | null, // The GraphQL variables
  reqOptions: { [key: string]: any } | null, // Any additional items to set on `req` (e.g. `{user: {id: 17}}`)
  checker: (
    result: ExecutionResult,
    context: { pgClient: PoolClient }
  ) => void | ExecutionResult | Promise<void | ExecutionResult> = () => {} // Place test assertions in this function
) {
  if (!ctx) throw new Error("No ctx!");
  const { schema, rootPgPool, pgl } = ctx;
  const resolvedPreset = pgl.getResolvedPreset();
  const req = new MockReq({
    url: resolvedPreset.grafserv?.graphqlPath || "/graphql",
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...reqOptions,
  });
  const res: any = { req };
  req.res = res;

  let checkResult: ExecutionResult | void;
  const document = parse(query);
  const errors = validate(schema, document);
  if (errors.length > 0) {
    throw errors[0];
  }
  const args: ExecutionArgs = {
    schema,
    document,
    contextValue: {
      __TESTING: true,
    },
    variableValues: variables,
  };
  await hookArgs(
    args,
    { node: { req, res }, expressv4: { req, res } },
    resolvedPreset
  );

  // Because we're connected as the database owner, we should manually switch to
  // the authenticator role
  const context = args.contextValue as Grafast.Context;
  if (!context.pgSettings?.role) {
    context.pgSettings = context.pgSettings ?? {};
    context.pgSettings.role = process.env.DATABASE_AUTHENTICATOR as string;
  }

  const pgClient = await rootPgPool.connect();
  try {
    await pgClient.query("begin");

    // Override withPgClient with a transactional version for the tests
    const withPgClient = makeWithPgClientViaPgClientAlreadyInTransaction(
      pgClient,
      true
    );
    context.withPgClient = withPgClient;

    const result = (await execute(args, resolvedPreset)) as ExecutionResult;
    // Expand errors
    if (result.errors) {
      if (resolvedPreset.grafserv?.maskError) {
        result.errors = result.errors.map(resolvedPreset.grafserv.maskError);
      } else {
        // This does a similar transform that PostGraphile does to errors.
        // It's not the same. Sorry.
        result.errors = result.errors.map((rawErr) => {
          const e = Object.create(rawErr);
          Object.defineProperty(e, "originalError", {
            value: rawErr.originalError,
            enumerable: false,
          });

          if (e.originalError) {
            Object.keys(e.originalError).forEach((k) => {
              try {
                e[k] = e.originalError[k];
              } catch (err) {
                // Meh.
              }
            });
          }
          return e;
        });
      }
    }

    // This is were we call the `checker` so you can do your assertions.
    // Also note that we pass the `replacementPgClient` so that you can
    // query the data in the database from within the transaction before it
    // gets rolled back.
    checkResult = await checker(result, {
      pgClient,
    });

    // You don't have to keep this, I just like knowing when things change!
    expect(sanitize(result)).toMatchSnapshot();

    return checkResult == null ? result : checkResult;
  } finally {
    try {
      await pgClient.query("rollback");
    } finally {
      pgClient.release();
    }
  }
};

import { Pool, PoolClient } from "pg";
import {
  createPostGraphileSchema,
  withPostGraphileContext,
  PostGraphileOptions,
} from "postgraphile";
import { Request, Response } from "express";
import { graphql, GraphQLSchema, ExecutionResult } from "graphql";
import { getPostGraphileOptions } from "../src/middleware/installPostGraphile";
import {
  createUsers,
  poolFromUrl,
  createSession,
} from "../../__tests__/helpers";
import handleErrors from "../src/utils/handleErrors";

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

/*
 * This function replaces values that are expected to change with static
 * placeholders so that our snapshot testing doesn't throw an error
 * every time we run the tests because time has ticked on in it's inevitable
 * march toward the future.
 */
export function sanitise(json: any): any {
  if (Array.isArray(json)) {
    return json.map(sanitise);
  } else if (json && typeof json === "object") {
    const result = { ...json };
    for (const k in result) {
      if (k === "nodeId" && typeof result[k] === "string") {
        result[k] = "[nodeId]";
      } else if (
        k === "id" ||
        (k.endsWith("Id") && typeof json[k] === "number")
      ) {
        result[k] = "[id]";
      } else if (
        (k.endsWith("At") || k === "datetime") &&
        typeof json[k] === "string"
      ) {
        result[k] = "[timestamp]";
      } else if (
        k.match(/^deleted[A-Za-z0-9]+Id$/) &&
        typeof json[k] === "string"
      ) {
        result[k] = "[nodeId]";
      } else {
        result[k] = sanitise(json[k]);
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
  options: PostGraphileOptions<Request, Response>;
  schema: GraphQLSchema;
}
let ctx: ICtx | null = null;

export const setup = async () => {
  const rootPgPool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
  });

  const options = getPostGraphileOptions({ rootPgPool });
  const schema = await createPostGraphileSchema(
    rootPgPool,
    "app_public",
    options
  );

  // Store the context
  ctx = {
    rootPgPool,
    options,
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
  } catch (e) {
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
  const { schema, rootPgPool, options } = ctx;
  const req = new MockReq({
    url: options.graphqlRoute || "/graphql",
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...reqOptions,
  });
  const res: any = { req };
  req.res = res;

  const {
    pgSettings: pgSettingsGenerator,
    additionalGraphQLContextFromRequest,
  } = options;
  const pgSettings =
    (typeof pgSettingsGenerator === "function"
      ? await pgSettingsGenerator(req)
      : pgSettingsGenerator) || {};

  // Because we're connected as the database owner, we should manually switch to
  // the authenticator role
  if (!pgSettings.role) {
    pgSettings.role = process.env.DATABASE_AUTHENTICATOR;
  }

  await withPostGraphileContext(
    {
      ...options,
      pgPool: rootPgPool,
      pgSettings,
      pgForceTransaction: true,
    },
    async context => {
      let checkResult;
      const { pgClient } = context;
      try {
        // This runs our GraphQL query, passing the replacement client
        const additionalContext = additionalGraphQLContextFromRequest
          ? await additionalGraphQLContextFromRequest(req, res)
          : null;
        const result = await graphql(
          schema,
          query,
          null,
          {
            ...context,
            ...additionalContext,
            __TESTING: true,
          },
          variables
        );
        // Expand errors
        if (result.errors) {
          if (options.handleErrors) {
            result.errors = handleErrors(result.errors);
          } else {
            // This does a similar transform that PostGraphile does to errors.
            // It's not the same. Sorry.
            result.errors = result.errors.map(rawErr => {
              const e = Object.create(rawErr);
              Object.defineProperty(e, "originalError", {
                value: rawErr.originalError,
                enumerable: false,
              });

              if (e.originalError) {
                Object.keys(e.originalError).forEach(k => {
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
        expect(sanitise(result)).toMatchSnapshot();

        return checkResult == null ? result : checkResult;
      } finally {
        // Rollback the transaction so no changes are written to the DB - this
        // makes our tests fairly deterministic.
        await pgClient.query("rollback");
      }
    }
  );
};

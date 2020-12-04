import PgPubsub from "@graphile/pg-pubsub";
import GraphilePro from "@graphile/pro"; // Requires license key
import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";
import { Express, Request, Response } from "express";
import { NodePlugin } from "graphile-build";
import { resolve } from "path";
import { Pool, PoolClient } from "pg";
import {
  enhanceHttpServerWithSubscriptions,
  makePluginHook,
  Middleware,
  postgraphile,
  PostGraphileOptions,
} from "postgraphile";
import { makePgSmartTagsFromFilePlugin } from "postgraphile/plugins";

import { getHttpServer, getWebsocketMiddlewares } from "../app";
import OrdersPlugin from "../plugins/Orders";
import PassportLoginPlugin from "../plugins/PassportLoginPlugin";
import PrimaryKeyMutationsOnlyPlugin from "../plugins/PrimaryKeyMutationsOnlyPlugin";
import RemoveQueryQueryPlugin from "../plugins/RemoveQueryQueryPlugin";
import SubscriptionsPlugin from "../plugins/SubscriptionsPlugin";
import handleErrors from "../utils/handleErrors";
import { getAuthPgPool, getRootPgPool } from "./installDatabasePools";

export interface OurGraphQLContext {
  pgClient: PoolClient;
  sessionId: string | null;
  rootPgPool: Pool;
  login(user: any): Promise<void>;
  logout(): Promise<void>;
}

const TagsFilePlugin = makePgSmartTagsFromFilePlugin(
  // We're using JSONC for VSCode compatibility; also using an explicit file
  // path keeps the tests happy.
  resolve(__dirname, "../../postgraphile.tags.jsonc")
);

type UUID = string;

const isTest = process.env.NODE_ENV === "test";

function uuidOrNull(input: string | number | null | undefined): UUID | null {
  if (!input) return null;
  const str = String(input);
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      str
    )
  ) {
    return str;
  } else {
    return null;
  }
}

const isDev = process.env.NODE_ENV === "development";
//const isTest = process.env.NODE_ENV === "test";

const pluginHook = makePluginHook([
  // Add the pub/sub realtime provider
  PgPubsub,

  // If we have a Graphile Pro license, then enable the plugin
  ...(process.env.GRAPHILE_LICENSE ? [GraphilePro] : []),
]);

interface IPostGraphileOptionsOptions {
  websocketMiddlewares?: Middleware<Request, Response>[];
  rootPgPool: Pool;
}

export function getPostGraphileOptions({
  websocketMiddlewares,
  rootPgPool,
}: IPostGraphileOptionsOptions) {
  const options: PostGraphileOptions<Request, Response> = {
    // This is for PostGraphile server plugins: https://www.graphile.org/postgraphile/plugins/
    pluginHook,

    // This is so that PostGraphile installs the watch fixtures, it's also needed to enable live queries
    ownerConnectionString: process.env.DATABASE_URL,

    // On production we still want to start even if the database isn't available.
    // On development, we want to deal nicely with issues in the database.
    // For these reasons, we're going to keep retryOnInitFail enabled for both environments.
    retryOnInitFail: !isTest,

    // Add websocket support to the PostGraphile server; you still need to use a subscriptions plugin such as
    // @graphile/pg-pubsub
    subscriptions: true,
    websocketMiddlewares,

    // enableQueryBatching: On the client side, use something like apollo-link-batch-http to make use of this
    enableQueryBatching: true,

    // dynamicJson: instead of inputting/outputting JSON as strings, input/output raw JSON objects
    dynamicJson: true,

    // ignoreRBAC=false: honour the permissions in your DB - don't expose what you don't GRANT
    ignoreRBAC: false,

    // ignoreIndexes=false: honour your DB indexes - only expose things that are fast
    ignoreIndexes: false,

    // setofFunctionsContainNulls=false: reduces the number of nulls in your schema
    setofFunctionsContainNulls: false,

    // Enable GraphiQL in development
    graphiql: isDev || !!process.env.ENABLE_GRAPHIQL,
    // Use a fancier GraphiQL with `prettier` for formatting, and header editing.
    enhanceGraphiql: true,
    // Allow EXPLAIN in development (you can replace this with a callback function if you want more control)
    allowExplain: isDev,

    // Disable query logging - we're using morgan
    disableQueryLog: true,

    // Custom error handling
    handleErrors,
    /*
     * To use the built in PostGraphile error handling, you can use the
     * following code instead of `handleErrors` above. Using `handleErrors`
     * gives you much more control (and stability) over how errors are
     * output to the user.
     */
    /*
        // See https://www.graphile.org/postgraphile/debugging/
        extendedErrors:
          isDev || isTest
            ? [
                "errcode",
                "severity",
                "detail",
                "hint",
                "positon",
                "internalPosition",
                "internalQuery",
                "where",
                "schema",
                "table",
                "column",
                "dataType",
                "constraint",
              ]
            : ["errcode"],
        showErrorStack: isDev || isTest,
        */

    // Automatically update GraphQL schema when database changes
    watchPg: isDev,

    // Keep data/schema.graphql up to date
    sortExport: true,
    exportGqlSchemaPath: isDev
      ? `${__dirname}/../../../../data/schema.graphql`
      : undefined,

    /*
     * Plugins to enhance the GraphQL schema, see:
     *   https://www.graphile.org/postgraphile/extending/
     */
    appendPlugins: [
      // PostGraphile adds a `query: Query` field to `Query` for Relay 1
      // compatibility. We don't need that.
      RemoveQueryQueryPlugin,

      // Adds support for our `postgraphile.tags.json5` file
      TagsFilePlugin,

      // Simplifies the field names generated by PostGraphile.
      PgSimplifyInflectorPlugin,

      // Omits by default non-primary-key constraint mutations
      PrimaryKeyMutationsOnlyPlugin,

      // Adds the `login` mutation to enable users to log in
      PassportLoginPlugin,

      // Adds realtime features to our GraphQL schema
      SubscriptionsPlugin,

      // Adds custom orders to our GraphQL schema
      OrdersPlugin,
    ],

    /*
     * Plugins we don't want in our schema
     */
    skipPlugins: [
      // Disable the 'Node' interface
      NodePlugin,
    ],

    graphileBuildOptions: {
      /*
       * Any properties here are merged into the settings passed to each Graphile
       * Engine plugin - useful for configuring how the plugins operate.
       */

      // Makes all SQL function arguments except those with defaults non-nullable
      pgStrictFunctions: true,
    },

    /*
     * Postgres transaction settings for each GraphQL query/mutation to
     * indicate to Postgres who is attempting to access the resources. These
     * will be referenced by RLS policies/triggers/etc.
     *
     * Settings set here will be set using the equivalent of `SET LOCAL`, so
     * certain things are not allowed. You can override Postgres settings such
     * as 'role' and 'search_path' here; but for settings indicating the
     * current user, session id, or other privileges to be used by RLS policies
     * the setting names must contain at least one and at most two period
     * symbols (`.`), and the first segment must not clash with any Postgres or
     * extension settings. We find `jwt.claims.*` to be a safe namespace,
     * whether or not you're using JWTs.
     */
    async pgSettings(req) {
      const sessionId = uuidOrNull(req.user?.session_id);
      if (sessionId) {
        // Update the last_active timestamp (but only do it at most once every 15 seconds to avoid too much churn).
        await rootPgPool.query(
          "UPDATE app_private.sessions SET last_active = NOW() WHERE uuid = $1 AND last_active < NOW() - INTERVAL '15 seconds'",
          [sessionId]
        );
      }
      return {
        // Everyone uses the "visitor" role currently
        role: process.env.DATABASE_VISITOR,

        /*
         * Note, though this says "jwt" it's not actually anything to do with
         * JWTs, we just know it's a safe namespace to use, and it means you
         * can use JWTs too, if you like, and they'll use the same settings
         * names reducing the amount of code you need to write.
         */
        "jwt.claims.session_id": sessionId,
      };
    },

    /*
     * These properties are merged into context (the third argument to GraphQL
     * resolvers). This is useful if you write your own plugins that need
     * access to, e.g., the logged in user.
     */
    async additionalGraphQLContextFromRequest(
      req
    ): Promise<Partial<OurGraphQLContext>> {
      return {
        // The current session id
        sessionId: uuidOrNull(req.user?.session_id),

        // Needed so passport can write to the database
        rootPgPool,

        // Use this to tell Passport.js we're logged in
        login: (user: any) =>
          new Promise((resolve, reject) => {
            req.login(user, (err) => (err ? reject(err) : resolve()));
          }),

        logout: () => {
          req.logout();
          return Promise.resolve();
        },
      };
    },

    // Pro plugin options (requires process.env.GRAPHILE_LICENSE)
    defaultPaginationCap:
      parseInt(process.env.GRAPHQL_PAGINATION_CAP || "", 10) || 50,
    graphqlDepthLimit:
      parseInt(process.env.GRAPHQL_DEPTH_LIMIT || "", 10) || 12,
    graphqlCostLimit:
      parseInt(process.env.GRAPHQL_COST_LIMIT || "", 10) || 30000,
    exposeGraphQLCost:
      (parseInt(process.env.HIDE_QUERY_COST || "", 10) || 0) < 1,
    // readReplicaPgPool ...,
  };
  return options;
}

export default function installPostGraphile(app: Express) {
  const websocketMiddlewares = getWebsocketMiddlewares(app);
  const authPgPool = getAuthPgPool(app);
  const rootPgPool = getRootPgPool(app);
  const middleware = postgraphile<Request, Response>(
    authPgPool,
    "app_public",
    getPostGraphileOptions({
      websocketMiddlewares,
      rootPgPool,
    })
  );

  app.set("postgraphileMiddleware", middleware);

  app.use(middleware);

  const httpServer = getHttpServer(app);
  if (httpServer) {
    enhanceHttpServerWithSubscriptions(httpServer, middleware);
  }
}

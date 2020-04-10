import { Build } from "graphile-build";
import { QueryBuilder, SQL } from "graphile-build-pg";
import {
  embed /*, AugmentedGraphQLFieldResolver */,
  gql,
  makeExtendSchemaPlugin,
} from "graphile-utils";
// graphile-utils doesn't export this yet
import { GraphQLResolveInfo } from "graphql";

import { OurGraphQLContext } from "../middleware/installPostGraphile";
type GraphileHelpers = any;
type AugmentedGraphQLFieldResolver<
  TSource,
  TContext,
  TArgs = { [argName: string]: any }
> = (
  parent: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo & {
    graphile: GraphileHelpers;
  }
) => any;

/*
 * PG NOTIFY events are sent via a channel, this function helps us determine
 * which channel to listen to for the currently logged in user by extracting
 * their `user_id` from the GraphQL context.
 *
 * NOTE: channels are limited to 63 characters in length (this is a PostgreSQL
 * limitation).
 */
const currentUserTopicFromContext = async (
  _args: {},
  context: { [key: string]: any },
  _resolveInfo: GraphQLResolveInfo
) => {
  if (context.sessionId /* fail fast */) {
    // We have the users session ID, but to get their actual ID we need to ask the database.
    const {
      rows: [user],
    } = await context.pgClient.query(
      "select app_public.current_user_id() as id"
    );
    if (user) {
      return `graphql:user:${user.id}`;
    }
  }
  throw new Error("You're not logged in");
};

/*
 * This plugin adds a number of custom subscriptions to our schema. By making
 * sure our subscriptions are tightly focussed we can ensure that our schema
 * remains scalable and that developers do not get overwhelmed with too many
 * subscription options being open. You can also use external sources of realtime
 * data when PostgreSQL's LISTEN/NOTIFY is not sufficient.
 *
 * Read more about this in the PostGraphile documentation:
 *
 * https://www.graphile.org/postgraphile/subscriptions/#custom-subscriptions
 *
 * And see the database trigger function `app_public.tg__graphql_subscription()`.
 */
const SubscriptionsPlugin = makeExtendSchemaPlugin((build) => {
  const { pgSql: sql } = build;
  return {
    typeDefs: gql`
       type UserSubscriptionPayload {
        user: User # Populated by our resolver below
        event: String # Part of the NOTIFY payload
      }

      extend type Subscription {
        """Triggered when the logged in user's record is updated in some way."""
        currentUserUpdated: UserSubscriptionPayload @pgSubscription(topic: ${embed(
          currentUserTopicFromContext
        )})
      }
    `,
    resolvers: {
      UserSubscriptionPayload: {
        user: recordByIdFromTable(build, sql.fragment`app_public.users`),
      },
    },
  };
});

/* The JSON object that `tg__graphql_subscription()` delivers via NOTIFY */
interface TgGraphQLSubscriptionPayload {
  event: string;
  subject: string | null;
}

/*
 * This function handles the boilerplate of fetching a record from the database
 * which has the 'id' equal to the 'subject' from the PG NOTIFY event payload
 * (see `tg__graphql_subscription()` trigger function in the database).
 */

function recordByIdFromTable(
  build: Build,
  sqlTable: SQL
): AugmentedGraphQLFieldResolver<TgGraphQLSubscriptionPayload, any> {
  const { pgSql: sql } = build;
  return async (
    event: TgGraphQLSubscriptionPayload,
    _args: {},
    _context: OurGraphQLContext,
    { graphile: { selectGraphQLResultFromTable } }
  ) => {
    const rows = await selectGraphQLResultFromTable(
      sqlTable,
      (tableAlias: SQL, sqlBuilder: QueryBuilder) => {
        sqlBuilder.where(
          sql.fragment`${tableAlias}.id = ${sql.value(event.subject)}`
        );
      }
    );
    return rows[0];
  };
}

export default SubscriptionsPlugin;

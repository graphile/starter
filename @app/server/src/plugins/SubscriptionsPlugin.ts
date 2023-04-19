import { jsonParse } from "@dataplan/json";
import { PgClassExpressionStep } from "@dataplan/pg";
import { access, context, lambda, listen, object, SafeError } from "grafast";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

/*
 * PG NOTIFY events are sent via a channel, this function helps us determine
 * which channel to listen to for the currently logged in user by extracting
 * their `user_id` from the GraphQL context.
 *
 * NOTE: channels are limited to 63 characters in length (this is a PostgreSQL
 * limitation).
 */
function currentUserTopicByUserId(userId: number | null) {
  if (userId) {
    return `graphql:user:${userId}`;
  } else {
    throw new SafeError("You're not logged in");
  }
}

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
  const currentUserIdResource =
    build.input.pgRegistry.pgResources.current_user_id;
  if (!currentUserIdResource) {
    throw new Error("Couldn't find current_user_id source");
  }
  const usersResource = Object.values(build.input.pgRegistry.pgResources).find(
    (s) =>
      !s.parameters &&
      s.extensions?.pg?.schemaName === "app_public" &&
      s.extensions.pg.name === "users"
  );
  if (!usersResource) {
    throw new Error("Couldn't find source for app_public.users");
  }

  return {
    typeDefs: gql`
      type UserSubscriptionPayload {
        user: User # Populated by our resolver below
        event: String # Part of the NOTIFY payload
      }

      extend type Subscription {
        """
        Triggered when the logged in user's record is updated in some way.
        """
        currentUserUpdated: UserSubscriptionPayload
      }
    `,
    plans: {
      Subscription: {
        currentUserUpdated: {
          subscribePlan() {
            const $pgSubscriber = context().get("pgSubscriber");
            // We have the users session ID, but to get their actual ID we need to ask the database.
            const $userId =
              currentUserIdResource.execute() as PgClassExpressionStep<
                any,
                any
              >;
            const $topic = lambda($userId, currentUserTopicByUserId);
            return listen($pgSubscriber, $topic, (e) => e);
          },
          plan($e) {
            return jsonParse<TgGraphQLSubscriptionPayload>($e);
          },
        },
      },
      UserSubscriptionPayload: {
        user($obj) {
          const $id = access($obj, "subject");
          return usersResource.get({ id: $id });
        },
      },
    },
  };
});

/* The JSON object that `tg__graphql_subscription()` delivers via NOTIFY */
interface TgGraphQLSubscriptionPayload {
  event: string;
  subject: string | null;
  [key: string]: string | null;
}

export default SubscriptionsPlugin;

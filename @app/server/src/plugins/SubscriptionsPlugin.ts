import {
  access,
  context,
  listen,
  lambda,
  SafeError,
  ExecutableStep,
} from "grafast";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import { PgClassExpressionStep } from "@dataplan/pg";

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
  const currentUserIdSource = build.input.pgSources.find(
    (s) => s.name === "current_user_id"
  );
  if (!currentUserIdSource) {
    throw new Error("Couldn't find current_user_id source");
  }
  const usersSource = build.input.pgSources.find((s) => s.name === "users");
  if (!usersSource) {
    throw new Error("Couldn't find users source");
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
        currentUserUpdated() {
          const $pgSubscriber = context().get("pgSubscriber");
          // We have the users session ID, but to get their actual ID we need to ask the database.
          const $userId =
            currentUserIdSource.execute() as PgClassExpressionStep<
              any,
              any,
              any,
              any,
              any
            >;
          const $topic = lambda($userId, currentUserTopicByUserId);
          return listen(
            $pgSubscriber,
            $topic,
            (e) => e as ExecutableStep<TgGraphQLSubscriptionPayload>
          );
        },
      },
      UserSubscriptionPayload: {
        user($obj) {
          const $id = access($obj, "subject");
          return usersSource.get({ id: $id });
        },
      },
    },
  };
});

/* The JSON object that `tg__graphql_subscription()` delivers via NOTIFY */
interface TgGraphQLSubscriptionPayload {
  event: string;
  subject: string | null;
}

export default SubscriptionsPlugin;

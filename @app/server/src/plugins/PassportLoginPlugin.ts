import { PgClassExpressionStep } from "@dataplan/pg";
import { access, SafeError } from "grafast";
import { gql, makeExtendSchemaPlugin,Plans,Resolvers  } from "graphile-utils";

import type {} from "../middleware/installPostGraphile";
import { ERROR_MESSAGE_OVERRIDES } from "../utils/handleErrors";

const PassportLoginPlugin = makeExtendSchemaPlugin((build) => {
  const typeDefs = gql`
    input RegisterInput {
      username: String!
      email: String!
      password: String!
      name: String
      avatarUrl: String
    }

    type RegisterPayload {
      user: User!
    }

    input LoginInput {
      username: String!
      password: String!
    }

    type LoginPayload {
      user: User!
    }

    type LogoutPayload {
      success: Boolean
    }

    """
    All input for the \`resetPassword\` mutation.
    """
    input ResetPasswordInput {
      """
      An arbitrary string value with no semantic meaning. Will be included in the
      payload verbatim. May be used to track mutations by the client.
      """
      clientMutationId: String

      userId: UUID!
      resetToken: String!
      newPassword: String!
    }

    """
    The output of our \`resetPassword\` mutation.
    """
    type ResetPasswordPayload {
      """
      The exact same \`clientMutationId\` that was provided in the mutation input,
      unchanged and unused. May be used by a client to track mutations.
      """
      clientMutationId: String

      """
      Our root query field type. Allows us to run any query from our mutation payload.
      """
      query: Query

      success: Boolean
    }

    extend type Mutation {
      """
      Use this mutation to create an account on our system. This may only be used if you are logged out.
      """
      register(input: RegisterInput!): RegisterPayload

      """
      Use this mutation to log in to your account; this login uses sessions so you do not need to take further action.
      """
      login(input: LoginInput!): LoginPayload

      """
      Use this mutation to logout from your account. Don't forget to clear the client state!
      """
      logout: LogoutPayload

      """
      After triggering forgotPassword, you'll be sent a reset token. Combine this with your user ID and a new password to reset your password.
      """
      resetPassword(input: ResetPasswordInput!): ResetPasswordPayload
    }
  `;
  const userSource = build.input.pgSources.find((s) => s.name === "users");
  const currentUserIdSource = build.input.pgSources.find(
    (s) => s.name === "current_user_id"
  );
  if (!userSource || !currentUserIdSource) {
    throw new Error(
      "Couldn't find either the 'users' or 'current_user_id' source"
    );
  }
  const plans: Plans = {
    RegisterPayload: {
      user($obj) {
        const $userId = access($obj, "userId");
        return userSource.get({ id: $userId });
      },
    },
    LoginPayload: {
      user() {
        const $userId = currentUserIdSource.execute() as PgClassExpressionStep<
          any,
          any,
          any,
          any,
          any
        >;
        return userSource.get({ id: $userId });
      },
    },
  };
  const resolvers: Resolvers = {
    Mutation: {
      async register(_mutation, args, context: Grafast.Context) {
        const { username, password, email, name, avatarUrl } = args.input;
        const { rootPgPool, login, pgSettings } = context;
        try {
          // Create a user and create a session for it in the proccess
          const {
            rows: [details],
          } = await rootPgPool.query<{ user_id: number; session_id: string }>(
            `
            with new_user as (
              select users.* from app_private.really_create_user(
                username => $1,
                email => $2,
                email_is_verified => false,
                name => $3,
                avatar_url => $4,
                password => $5
              ) users where not (users is null)
            ), new_session as (
              insert into app_private.sessions (user_id)
              select id from new_user
              returning *
            )
            select new_user.id as user_id, new_session.uuid as session_id
            from new_user, new_session`,
            [username, email, name, avatarUrl, password]
          );

          if (!details || !details.user_id) {
            throw Object.assign(new Error("Registration failed"), {
              code: "FFFFF",
            });
          }

          if (details.session_id) {
            // Update pgSettings so future queries will use the new session
            pgSettings!["jwt.claims.session_id"] = details.session_id;

            // Tell Passport.js we're logged in
            await login({ session_id: details.session_id });
          }

          return {
            userId: details.user_id,
          };
        } catch (e: any) {
          const { code } = e;
          const safeErrorCodes = [
            "WEAKP",
            "LOCKD",
            "EMTKN",
            ...Object.keys(ERROR_MESSAGE_OVERRIDES),
          ];
          if (safeErrorCodes.includes(code)) {
            // TODO: make SafeError
            throw e;
          } else {
            console.error(
              "Unrecognised error in PassportLoginPlugin; replacing with sanitized version"
            );
            console.error(e);
            throw Object.assign(new Error("Registration failed"), {
              code,
            });
          }
        }
      },
      async login(_mutation, args, context: Grafast.Context) {
        const { username, password } = args.input;
        const { rootPgPool, login, pgSettings } = context;
        try {
          // Call our login function to find out if the username/password combination exists
          const {
            rows: [session],
          } = await rootPgPool.query(
            `select sessions.* from app_private.login($1, $2) sessions where not (sessions is null)`,
            [username, password]
          );

          if (!session) {
            throw Object.assign(new Error("Incorrect username/password"), {
              code: "CREDS",
            });
          }

          if (session.uuid) {
            // Tell Passport.js we're logged in
            await login({ session_id: session.uuid });
          }

          // Update pgSettings so future queries will use the new session
          pgSettings!["jwt.claims.session_id"] = session.uuid;

          return {};
        } catch (e: any) {
          const code = e.extensions?.code ?? e.code;
          const safeErrorCodes = ["LOCKD", "CREDS"];
          if (safeErrorCodes.includes(code)) {
            // TODO: throw SafeError
            throw e;
          } else {
            console.error(e);
            throw Object.assign(new Error("Login failed"), {
              code,
            });
          }
        }
      },

      async logout(_mutation, _args, context: Grafast.Context) {
        const { pgSettings, withPgClient, logout } = context;
        await withPgClient(pgSettings, (pgClient) =>
          pgClient.query({ text: "select app_public.logout();" })
        );
        await logout();
        return {
          success: true,
        };
      },

      async resetPassword(_mutation, args, context: Grafast.Context) {
        const { rootPgPool } = context;
        const { userId, resetToken, newPassword, clientMutationId } =
          args.input;

        // Since the `reset_password` function needs to keep track of attempts
        // for security, we cannot risk the transaction being rolled back by a
        // later error. As such, we don't allow users to call this function
        // through normal means, instead calling it through our root pool
        // without a transaction.
        const {
          rows: [row],
        } = await rootPgPool.query(
          `select app_private.reset_password($1::uuid, $2::text, $3::text) as success`,
          [userId, resetToken, newPassword]
        );

        return {
          clientMutationId,
          success: row?.success,
        };
      },
    },
  };
  return {
    typeDefs,
    plans,
    resolvers,
  };
});

export default PassportLoginPlugin;

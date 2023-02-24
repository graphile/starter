import type { PgSelectStep } from "@dataplan/pg";
import type { SQL } from "pg-sql2";

// TODO: reimplement makeAddPgTableOrderByPlugin to make this short again
/*
export default makeAddPgTableOrderByPlugin(
  "app_public",
  "organization_memberships",
  ({ sql }) => {
    const sqlIdentifier = sql.identifier(Symbol("member"));
    return orderByAscDesc(
      "MEMBER_NAME",
      // @ts-ignore
      ({ queryBuilder }) => sql.fragment`(
        select ${sqlIdentifier}.name
        from app_public.users as ${sqlIdentifier}
        where ${sqlIdentifier}.id = ${queryBuilder.getTableAlias()}.user_id
        limit 1
      )`
    );
  }
);
*/

const StarterCustomOrdersPlugin: GraphileConfig.Plugin = {
  name: "StarterCustomOrdersPlugin",
  version: "0.0.0",

  schema: {
    hooks: {
      GraphQLEnumType_values(values, build, context) {
        const {
          sql,
          input: { pgSources },
        } = build;
        const {
          scope: { isPgRowSortEnum, pgCodec },
        } = context;
        if (
          !isPgRowSortEnum ||
          !pgCodec ||
          pgCodec.extensions?.pg?.schemaName !== "app_public" ||
          pgCodec.extensions?.pg?.typeName !== "organization_memberships"
        ) {
          return values;
        }

        const usersSource = pgSources.find((s) => s.name === "users");
        if (!usersSource) {
          return values;
        }

        for (const ascDesc of ["ASC" as const, "DESC" as const]) {
          const valueName = `MEMBER_NAME_${ascDesc}`;
          values = build.extend(
            values,
            {
              [valueName]: {
                extensions: {
                  graphile: {
                    applyPlan(step: PgSelectStep<any, any, any, any>) {
                      const sqlIdentifier = sql.identifier(Symbol("member"));
                      step.join({
                        type: "inner",
                        source: usersSource.source as SQL,
                        alias: sqlIdentifier,
                        conditions: [
                          sql`${sqlIdentifier}.id = ${step.alias}.user_id`,
                        ],
                      });
                      const expression = sql`${sqlIdentifier}.name`;
                      step.orderBy({
                        codec: usersSource.codec.columns["name"].codec,
                        fragment: expression,
                        direction: ascDesc,
                      });
                    },
                  },
                },
              },
            },
            `Adding ${ascDesc} orderBy enum value for ${pgCodec.name} from users.`
          );
        }

        return values;
      },
    },
  },
};

export default StarterCustomOrdersPlugin;

import { makeAddPgTableOrderByPlugin, orderByAscDesc } from "graphile-utils";
import type { SQL } from "pg-sql2";

/*
// This is a rudimentary translation of the old V4 plugin using a subquery,
// just to show changes can be minimal:

export default makeAddPgTableOrderByPlugin(
  { schemaName: "app_public", tableName: "organization_memberships" },
  ({ sql }) => {
    const sqlIdentifier = sql.identifier(Symbol("member"));
    return orderByAscDesc("MEMBER_NAME", ($organizationMemberships) => ({
      fragment: sql.fragment`(
        select ${sqlIdentifier}.name
        from app_public.users as ${sqlIdentifier}
        where ${sqlIdentifier}.id = ${$organizationMemberships.alias}.user_id
        limit 1
      )`,
      codec: TYPES.text,
    }));
  }
);

// But what follows is a more efficient implementation using a join:
*/

export default makeAddPgTableOrderByPlugin(
  { schemaName: "app_public", tableName: "organization_memberships" },
  (build) => {
    const {
      sql,
      input: { pgSources },
    } = build;
    const usersSource = pgSources.find(
      (s) =>
        !s.parameters &&
        s.extensions?.pg?.schemaName === "app_public" &&
        s.extensions.pg.name === "users"
    );
    if (!usersSource) {
      throw new Error(`Couldn't find the source for app_public.users`);
    }
    const sqlIdentifier = sql.identifier(Symbol("member"));
    return orderByAscDesc("MEMBER_NAME", ($organizationMemberships) => {
      $organizationMemberships.join({
        type: "inner",
        source: usersSource.source as SQL,
        alias: sqlIdentifier,
        conditions: [
          sql`${sqlIdentifier}.id = ${$organizationMemberships.alias}.user_id`,
        ],
      });
      return {
        fragment: sql`${sqlIdentifier}.name`,
        codec: usersSource.codec.columns["name"].codec,
      };
    });
  }
);

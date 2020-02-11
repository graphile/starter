import { makeAddPgTableOrderByPlugin, orderByAscDesc } from "graphile-utils";

export default makeAddPgTableOrderByPlugin(
  "app_public",
  "organization_memberships",
  ({ pgSql: sql }) => {
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

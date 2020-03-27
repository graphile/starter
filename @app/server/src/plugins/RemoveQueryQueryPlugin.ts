import { Plugin } from "postgraphile";

const RemoveQueryQueryPlugin: Plugin = (builder) => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    if (context.scope.isRootQuery) {
      const { query, ...rest } = fields;
      // Drop the `query` field
      return rest;
    } else {
      return fields;
    }
  });
};

export default RemoveQueryQueryPlugin;

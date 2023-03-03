import { Plugin } from "postgraphile";

const RemoveQueryQueryPlugin: Plugin = (builder) => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    if (context.scope.isRootQuery) {
      delete fields.query;
    }
    return fields;
  });
};

export default RemoveQueryQueryPlugin;

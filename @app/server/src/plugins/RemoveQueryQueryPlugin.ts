const RemoveQueryQueryPlugin: GraphileConfig.Plugin = {
  name: "RemoveQueryQueryPlugin",
  version: "0.0.0",
  schema: {
    hooks: {
      GraphQLObjectType_fields(fields, _build, context) {
        if (context.scope.isRootQuery) {
          delete fields.query;
        }
        return fields;
      },
    },
  },
};

export default RemoveQueryQueryPlugin;

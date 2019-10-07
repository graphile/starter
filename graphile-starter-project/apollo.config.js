module.exports = {
  client: {
    includes: ["./client/src/**/*.graphql"],
    service: {
      name: "postgraphile",
      localSchemaFile: `${__dirname}/data/schema.graphql`,
    },
  },
};

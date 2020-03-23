import { Plugin, Build, ScopeGraphQLScalarType } from "graphile-build";
import { PgType } from "graphile-build-pg";
import { parse as parseUrl, format as formatUrl, Url } from "url";

declare module "graphile-build" {
  interface ScopeGraphQLScalarType {
    isUrlScalar?: boolean;
  }
}

export default (function PgTypeUrlPlugin(builder) {
  builder.hook(
    "build",
    build => {
      // This hook tells graphile-build-pg about the URL database type so it
      // knows how to express it in input/output.
      const {
        pgIntrospectionResultsByKind: rawIntrospectionResultsByKind,
        pgRegisterGqlTypeByTypeId,
        pgRegisterGqlInputTypeByTypeId,
        pg2GqlMapper,
        pgSql: sql,
      } = build;

      if (
        !rawIntrospectionResultsByKind ||
        !sql ||
        !pgRegisterGqlTypeByTypeId ||
        !pgRegisterGqlInputTypeByTypeId ||
        !pg2GqlMapper
      ) {
        throw new Error("Required helpers were not found on Build.");
      }

      const introspectionResultsByKind = rawIntrospectionResultsByKind;

      // Get the 'URL' type:
      const urlType = introspectionResultsByKind.type.find(
        (t: PgType) => t.name === "URL"
      );

      if (!urlType) {
        return build;
      }

      const urlTypeName = build.inflection.builtin("URL");

      const GraphQLURLType = makeGraphQLURLType(build as Build, urlTypeName);

      // Now register the URL type with the type system for both output and input.
      pgRegisterGqlTypeByTypeId(urlType.id, () => GraphQLURLType);
      pgRegisterGqlInputTypeByTypeId(urlType.id, () => GraphQLURLType);

      // Finally we must tell the system how to translate the data between PG-land and JS-land:
      pg2GqlMapper[urlType.id] = {
        // Turn string (from node-postgres) into URL object
        map: parseUrl,
        // When unmapping we need to convert back to string
        unmap: (url: Url) =>
          sql.fragment`(${sql.value(formatUrl(url))}::${sql.identifier(
            urlType.namespaceName,
            urlType.name
          )})`,
      };

      return build;
    },
    ["PgTypeUrl"],
    [],
    ["PgTypes"]
  );

  /* End of URL type */
} as Plugin);

function makeGraphQLURLType(build: Build, urlTypeName: string) {
  const {
    graphql: { GraphQLScalarType, Kind },
  } = build;
  function parseValue(obj: unknown): Url {
    if (!(typeof obj === "string")) {
      throw new TypeError(
        `This is not a valid ${urlTypeName} object, it must be a string.`
      );
    }
    return parseUrl(obj);
  }

  const parseLiteral: import("graphql").GraphQLScalarLiteralParser<any> = (
    ast,
    variables
  ) => {
    switch (ast.kind) {
      case Kind.STRING: {
        return parseUrl(ast.value);
      }

      case Kind.NULL:
        return null;

      case Kind.VARIABLE: {
        const name = ast.name.value;
        const value = variables ? variables[name] : undefined;
        return parseUrl(value);
      }

      default:
        return undefined;
    }
  };

  const scope: ScopeGraphQLScalarType = { isUrlScalar: true };
  const GraphQLURLType = build.newWithHooks(
    GraphQLScalarType,
    {
      name: urlTypeName,
      description:
        "A Uniform Resource Locator (URL), colloquially termed a web address. It is a reference to a web resource that specifies its location on a computer network and a mechanism for retrieving it.",
      serialize: (url: Url) => formatUrl(url),
      parseValue,
      parseLiteral,
    },
    scope
  );

  return GraphQLURLType;
}

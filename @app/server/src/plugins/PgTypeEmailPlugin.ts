import { Plugin, Build, ScopeGraphQLScalarType } from "graphile-build";
import { PgType } from "graphile-build-pg";

declare module "graphile-build" {
  interface ScopeGraphQLScalarType {
    isEmailScalar?: boolean;
  }
}

function isValidEmail(email: string) {
  return /[^@]+@[^@]+\.[^@]+/.test(email);
}

export default (function PgTypeEmailPlugin(builder) {
  builder.hook(
    "build",
    build => {
      // This hook tells graphile-build-pg about the email database type so it
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

      // Get the 'email' type:
      const emailType = introspectionResultsByKind.type.find(
        (t: PgType) => t.name === "email"
      );

      if (!emailType) {
        return build;
      }

      const emailTypeName = build.inflection.builtin("Email");

      const GraphQLEmailType = makeGraphQLEmailType(
        build as Build,
        emailTypeName
      );

      // Now register the Email type with the type system for both output and input.
      pgRegisterGqlTypeByTypeId(emailType.id, () => GraphQLEmailType);
      pgRegisterGqlInputTypeByTypeId(emailType.id, () => GraphQLEmailType);

      // Finally we must tell the system how to translate the data between PG-land and JS-land:
      pg2GqlMapper[emailType.id] = {
        // Turn string (from node-postgres) into email: no-op
        map: (email: string) => email,
        // When unmapping we need to convert back to SQL framgent
        unmap: (email: string) =>
          sql.fragment`(${sql.value(email)}::${sql.identifier(
            emailType.namespaceName,
            emailType.name
          )})`,
      };

      return build;
    },
    ["PgTypeEmail"],
    [],
    ["PgTypes"]
  );

  /* End of email type */
} as Plugin);

function makeGraphQLEmailType(build: Build, emailTypeName: string) {
  const {
    graphql: { GraphQLScalarType, Kind },
  } = build;
  function parseValue(obj: unknown): string {
    if (!(typeof obj === "string")) {
      throw new TypeError(
        `This is not a valid ${emailTypeName} object, it must be a string.`
      );
    }
    if (!isValidEmail(obj)) {
      throw new TypeError(
        `This is not a properly formatted ${emailTypeName} object.`
      );
    }
    return obj;
  }

  const parseLiteral: import("graphql").GraphQLScalarLiteralParser<any> = (
    ast,
    variables
  ) => {
    switch (ast.kind) {
      case Kind.STRING: {
        const email = ast.value;
        if (!isValidEmail(email)) {
          throw new TypeError(
            `This is not a properly formatted ${emailTypeName} object.`
          );
        }
        return email;
      }

      case Kind.NULL:
        return null;

      case Kind.VARIABLE: {
        const name = ast.name.value;
        const email = variables ? variables[name] : undefined;
        if (!isValidEmail(email)) {
          throw new TypeError(
            `This is not a properly formatted ${emailTypeName} object.`
          );
        }
        return email;
      }

      default:
        return undefined;
    }
  };

  const scope: ScopeGraphQLScalarType = { isEmailScalar: true };
  const GraphQLEmailType = build.newWithHooks(
    GraphQLScalarType,
    {
      name: emailTypeName,
      description:
        "An address in the electronic mail system. Email addresses such as `John.Smith@example.com` are made up of a local-part, followed by an `@` symbol, followed by a domain.",
      serialize: (email: string) => email,
      parseValue,
      parseLiteral,
    },
    scope
  );

  return GraphQLEmailType;
}

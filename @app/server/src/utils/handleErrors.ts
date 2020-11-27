import { GraphQLError } from "graphql";
import { camelCase } from "lodash";

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

const ERROR_PROPERTIES_TO_EXPOSE =
  isDev || isTest
    ? [
        "code",
        "severity",
        "detail",
        "hint",
        "positon",
        "internalPosition",
        "internalQuery",
        "where",
        "schema",
        "table",
        "column",
        "dataType",
        "constraint",
      ]
    : ["code"];

// This would be better as a macro...
const pluck = (err: any): { [key: string]: any } => {
  return ERROR_PROPERTIES_TO_EXPOSE.reduce((memo, key) => {
    const value =
      key === "code"
        ? // err.errcode is equivalent to err.code; replace it
          err.code || err.errcode
        : err[key];
    if (value != null) {
      memo[key] = value;
    }
    return memo;
  }, {});
};

/**
 * This map allows you to override the error object output to users from
 * database errors.
 *
 * See `docs/error_codes.md` for a list of error codes we use internally.
 *
 * See https://www.postgresql.org/docs/current/errcodes-appendix.html for a
 * list of error codes that PostgreSQL produces.
 */
export const ERROR_MESSAGE_OVERRIDES: { [code: string]: typeof pluck } = {
  "42501": (err) => ({
    ...pluck(err),
    message: "Permission denied (by RLS)",
  }),
  "23505": (err) => ({
    ...pluck(err),
    message: "Conflict occurred",
    fields: conflictFieldsFromError(err),
    code: "NUNIQ",
  }),
  "23503": (err) => ({
    ...pluck(err),
    message: "Invalid reference",
    fields: conflictFieldsFromError(err),
    code: "BADFK",
  }),
};

function conflictFieldsFromError(err: any) {
  const { table, constraint } = err;
  // TODO: extract a list of constraints from the DB
  if (constraint && table) {
    const PREFIX = `${table}_`;
    const SUFFIX_LIST = [`_key`, `_fkey`];
    if (constraint.startsWith(PREFIX)) {
      const matchingSuffix = SUFFIX_LIST.find((SUFFIX) =>
        constraint.endsWith(SUFFIX)
      );
      if (matchingSuffix) {
        const maybeColumnNames = constraint.substr(
          PREFIX.length,
          constraint.length - PREFIX.length - matchingSuffix.length
        );
        return [camelCase(maybeColumnNames)];
      }
    }
  }
  return undefined;
}

export default function handleErrors(
  errors: readonly GraphQLError[]
): Array<any> {
  return errors.map((error) => {
    const { message: rawMessage, locations, path, originalError } = error;
    const code = originalError ? originalError["code"] : null;
    const localPluck = ERROR_MESSAGE_OVERRIDES[code] || pluck;
    const exception = localPluck(originalError || error);
    return {
      message: exception.message || rawMessage,
      locations,
      path,
      extensions: {
        exception,
      },
    };
  });
}

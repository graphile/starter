/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import { GraphQLError } from "graphql";

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

const ERROR_PROPERTIES_TO_EXPOSE =
  isDev || isTest
    ? [
        "errcode",
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
    : ["errcode"];

/**
 * This map allows you to override the error message output to users from
 * database errors.
 *
 * See `docs/error_codes.md` for a list of error codes we use internally.
 *
 * See https://www.postgresql.org/docs/current/errcodes-appendix.html for a
 * list of error codes that PostgreSQL produces.
 */
const ERROR_MESSAGE_OVERRIDES = {
  "42501": "Permission denied (by RLS)",
};

// This would be better as a macro...
const pluck = (err: any) => {
  return ERROR_PROPERTIES_TO_EXPOSE.reduce((memo, key) => {
    const value = key === "errcode" ? err.code : err[key];
    if (value != null) {
      memo[key] = value;
    }
    return memo;
  }, {});
};

export default function handleErrors(
  errors: readonly GraphQLError[]
): Array<any> {
  return errors.map(error => {
    const { message: rawMessage, locations, path, originalError = {} } = error;
    const code = originalError ? originalError["code"] : null;
    const message = ERROR_MESSAGE_OVERRIDES[code] || rawMessage;
    return {
      message,
      locations,
      path,
      extensions: {
        exception: pluck(originalError),
      },
    };
  });
}

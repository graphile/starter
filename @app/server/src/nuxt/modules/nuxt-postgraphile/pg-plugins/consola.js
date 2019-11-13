import chalk from "chalk";

/*
 * Rather than importing GraphQL directly, we use PostGraphile's version of
 * GraphQL. This helps us to avoid issues related to having multiple GraphQL
 * versions installed.
 */
let graphql;

/*
 * Below is the definition of a PostGraphile server plugin. You can read more
 * about this type of plugin here:
 *
 * https://www.graphile.org/postgraphile/plugins/
 *
 * The **most important thing** you must keep in mind when writing a plugin is
 * that each plugin method *must* return either the value it was passed, or a
 * derivative of (or replacement for) it. If you don't do this, you may get
 * spurious errors.
 */
export default function({ logger }) {
  return {
    ["init"](_, { graphql: _graphql }) {
      // See the note by `let graphql` above.
      graphql = _graphql;
      return _;
    },

    ["postgraphile:options"](options) {
      return {
        ...options,
        disableQueryLog: true, // Bypass PostGraphile's internal logging
      };
    },

    ["postgraphile:http:handler"](req) {
      // For timing
      req._consolaPluginStartTime = process.hrtime();
      return req;
    },

    ["postgraphile:http:result"](result, { queryDocumentAst, pgRole, req }) {
      /*
       * Originally taken from PostGraphile's internal implementation:
       * https://github.com/graphile/postgraphile/blob/1719cbfef041e59536482ed20551d593fb82f78e/src/postgraphile/http/createPostGraphileHttpRequestHandler.ts#L748-L776
       * Augmented to use consola.
       */
      if (!queryDocumentAst) {
        return result;
      }

      // We must reference this before it's deleted!
      const resultStatusCode = result.statusCode;
      const timeDiff = process.hrtime(req._consolaPluginStartTime);

      // We setImmediate so that performing the log does not interfere with
      // returning the result to the user (reduces latency).
      setImmediate(() => {
        // Pretty-printing this query is not cheap it's probably smart not to do
        // this in production if performance is critical to you.
        const prettyQuery = graphql
          .print(queryDocumentAst)
          .replace(/\s+/g, " ")
          .trim();
        const errorCount = (result.errors || []).length;
        const ms = timeDiff[0] * 1e3 + timeDiff[1] * 1e-6;

        let message;
        if (resultStatusCode === 401) {
          message = chalk.red(`401 authentication error`);
        } else if (resultStatusCode === 403) {
          message = chalk.red(`403 forbidden error`);
        } else {
          message = chalk[errorCount === 0 ? "green" : "red"](
            `${errorCount} error(s)`
          );
        }
        const consolaMethod =
          errorCount > 0 || resultStatusCode >= 400 ? "error" : "success";
        logger[consolaMethod](
          `${message} ${
            pgRole != null ? `as ${chalk.magenta(pgRole)} ` : ""
          }in ${chalk.grey(`${ms.toFixed(2)}ms`)} :: ${prettyQuery}`
        );
      });
      return result;
    },
  };
}

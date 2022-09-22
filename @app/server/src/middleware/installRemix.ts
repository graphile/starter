import { getSdk } from "@app/graphql";
import { GraphqlQueryError, LoaderContext } from "@app/lib";
import { createRequestHandler } from "@remix-run/express";
import Tokens from "csrf";
import { Express, static as staticMiddleware } from "express";
import { DocumentNode, execute, GraphQLError } from "graphql";
import { HeadersInit } from "node-fetch";
import postgraphile from "postgraphile";

import handleErrors from "../utils/handleErrors";

if (!process.env.NODE_ENV) {
  throw new Error("No NODE_ENV envvar! Try `export NODE_ENV=development`");
}

const tokens = new Tokens();

// const isDev = process.env.NODE_ENV === "development";

export default async function installRemix(app: Express) {
  // Remix fingerprints its assets so we can cache forever.
  app.use(
    "/build",
    staticMiddleware(`${__dirname}/../../../client/public/build`, {
      immutable: true,
      maxAge: "1y",
    })
  );

  const remixApp = createRequestHandler({
    build: require(`${__dirname}/../../../client/build`),
    mode: process.env.NODE_ENV,
    getLoadContext(req, res): LoaderContext {
      const csrfToken = req.csrfToken();
      const cspNonce: string = res.locals.cspNonce;

      function validateCsrfToken(token: string) {
        return tokens.verify((req.session as any).csrfSecret, token);
      }

      const postgraphileInstance = app.get(
        "postgraphileMiddleware"
      ) as ReturnType<typeof postgraphile>;
      async function graphqlSdk() {
        const schema = await postgraphileInstance.getGraphQLSchema();
        const client = {
          async request<
            T = any,
            V extends Record<string, any> = Record<string, any>
          >(
            document: DocumentNode,
            variables?: V,
            requestHeaders?: HeadersInit
          ): Promise<T> {
            const { data, errors }: { data?: T; errors?: GraphQLError[] } =
              await postgraphileInstance.withPostGraphileContextFromReqRes(
                req,
                res,
                {},
                (context) =>
                  execute(
                    schema,
                    document,
                    null,
                    { ...(context as any as object), ...requestHeaders },
                    variables
                  )
              );
            if (errors != null && errors.length > 0) {
              const handledErrors = handleErrors(errors);
              throw new GraphqlQueryError(errors[0].message, handledErrors);
              // throw new GraphqlQueryError(errors[0].message, errors);
            }
            return data!;
          },
        };
        return getSdk(client as any);
      }
      return {
        cspNonce,
        csrfToken,
        graphqlSdk: graphqlSdk(),
        validateCsrfToken,
      };
    },
  });

  app.all("*", remixApp);
}

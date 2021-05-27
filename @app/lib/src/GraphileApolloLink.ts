import {
  ApolloLink,
  FetchResult,
  NextLink,
  Observable,
  Operation,
} from "@apollo/client";
import { Request, Response } from "express";
import { execute, getOperationAST } from "graphql";
import { HttpRequestHandler } from "postgraphile";

export interface GraphileApolloLinkInterface {
  /** The request object. */
  req: Request;

  /** The response object. */
  res: Response;

  /** The instance of the express middleware returned by calling `postgraphile()` */
  postgraphileMiddleware: HttpRequestHandler<Request, Response>;

  /** An optional rootValue to use inside resolvers. */
  rootValue?: any;
}

/**
 * A Graphile Apollo link for use during SSR. Allows Apollo Client to resolve
 * server-side requests without requiring an HTTP roundtrip.
 */
export class GraphileApolloLink extends ApolloLink {
  constructor(private options: GraphileApolloLinkInterface) {
    super();
  }

  request(
    operation: Operation,
    _forward?: NextLink
  ): Observable<FetchResult> | null {
    const { postgraphileMiddleware, req, res, rootValue } = this.options;
    return new Observable((observer) => {
      (async () => {
        try {
          const op = getOperationAST(operation.query, operation.operationName);
          if (!op || op.operation !== "query") {
            if (!observer.closed) {
              /* Only do queries (not subscriptions) on server side */
              observer.complete();
            }
            return;
          }
          const schema = await postgraphileMiddleware.getGraphQLSchema();
          const data =
            await postgraphileMiddleware.withPostGraphileContextFromReqRes(
              req,
              res,
              {},
              (context) =>
                execute(
                  schema,
                  operation.query,
                  rootValue || {},
                  context,
                  operation.variables,
                  operation.operationName
                )
            );
          if (!observer.closed) {
            observer.next(data);
            observer.complete();
          }
        } catch (e) {
          if (!observer.closed) {
            observer.error(e);
          } else {
            console.error(e);
          }
        }
      })();
    });
  }
}

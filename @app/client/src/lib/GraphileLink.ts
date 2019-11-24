import {
  ApolloLink,
  Operation,
  NextLink,
  FetchResult,
  Observable,
} from "apollo-link";
import { IncomingMessage, ServerResponse } from "http";
import { HttpRequestHandler } from "postgraphile";
import { execute } from "graphql";

/**
 * A graphile apollo link for SSR, this removes the necessity for the
 * application to call itself via HTTP to resolve server requests during SSR
 * Everything is done inside the same server process.
 *
 * @class GraphileLink
 * @extends {ApolloLink}
 */
export default class GraphileLink extends ApolloLink {
  /**
   *Creates an instance of GraphileLink.
   * @param {IncomingMessage} req The request object.
   * @param {ServerResponse} res The response object.
   * @param {HttpRequestHandler} grapahile The instance of the express middleware returned by calling `postgraphile()`
   * @param {*} [rootValue] An optional rootValue to use inside resolvers.
   * @memberof GraphileLink
   */
  constructor(
    public options: {
      req: IncomingMessage;
      res: ServerResponse;
      graphile: HttpRequestHandler;
      rootValue?: any;
    }
  ) {
    super();
  }
  request(
    operation: Operation,
    _forward?: NextLink
  ): Observable<FetchResult> | null {
    return new Observable(observer => {
      this.options.graphile
        .getGraphQLSchema()
        .then(schema =>
          this.options.graphile.withPostGraphileContextFromReqRes(
            this.options.req,
            this.options.res,
            {},
            context =>
              execute(
                schema,
                operation.query,
                this.options.rootValue || {},
                context,
                operation.variables,
                operation.operationName
              )
          )
        )
        .then(data => {
          if (!observer.closed) {
            observer.next(data);
            observer.complete();
          }
        })
        .catch(e => {
          if (!observer.closed) {
            observer.error(e);
          } else console.error(e);
        });
    });
  }
}

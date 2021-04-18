import { ApolloError } from "@apollo/client";
import { GraphQLError } from "graphql";

export function extractError(error: null): null;
export function extractError(error: Error): Error;
export function extractError(error: ApolloError): GraphQLError;
export function extractError(error: GraphQLError): GraphQLError;
export function extractError(
  error: null | Error | ApolloError | GraphQLError
): null | Error | GraphQLError;
export function extractError(
  error: null | Error | ApolloError | GraphQLError
): null | Error | GraphQLError {
  return (
    (error &&
      "graphQLErrors" in error &&
      error.graphQLErrors &&
      error.graphQLErrors.length &&
      error.graphQLErrors[0]) ||
    error
  );
}

export function getExceptionFromError(
  error: null | Error | ApolloError | GraphQLError
): Error | null {
  // @ts-ignore
  const graphqlError: GraphQLError = extractError(error);
  const exception =
    graphqlError &&
    graphqlError.extensions &&
    graphqlError.extensions.exception;
  return exception || graphqlError || error;
}

export function getCodeFromError(
  error: null | Error | ApolloError | GraphQLError
): null | string {
  const err = getExceptionFromError(error);
  return (err && err["code"]) || null;
}

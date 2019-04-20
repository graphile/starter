import { ApolloError } from "apollo-client";
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
    null
  );
}

export function getCodeFromError(
  error: null | Error | ApolloError | GraphQLError
): null | string {
  const err = extractError(error) || error;
  return (err && (err["errcode"] || err["code"])) || null;
}

import { Alert, Result } from "antd";
import { ApolloError } from "apollo-client";
import React from "react";

export interface ErrorAlertProps {
  error: ApolloError | Error;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <Result
      status="error"
      title="Unexpected error occurred"
      subTitle={
        <span>
          We're really sorry, but an unexpected error occurred. Please{" "}
          <a href="/">return to the homepage</a> and try again.
        </span>
      }
    >
      <Alert type="error" message={error.message} />
    </Result>
  );
}

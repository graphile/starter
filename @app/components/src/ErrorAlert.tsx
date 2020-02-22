import { Alert, Typography } from "antd";
import { ApolloError } from "apollo-client";
import React from "react";

const { Paragraph } = Typography;

export interface ErrorAlertProps {
  error: ApolloError | Error;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <Paragraph>
      <Alert
        message="Unexpected Error Occurred"
        description={
          <>
            <Paragraph>
              We're really sorry, but an unexpected error occurred. Please{" "}
              <a href="/">return to the homepage</a> and try again.
            </Paragraph>
            <Paragraph>Error details: {error.message}</Paragraph>
          </>
        }
        type="error"
        showIcon
      />
    </Paragraph>
  );
}

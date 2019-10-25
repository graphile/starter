import React from "react";
import { Alert, Typography } from "antd";
import { ApolloError } from "apollo-client";

const { Paragraph } = Typography;

interface IProps {
  error: ApolloError | Error;
}

export default function ErrorAlert({ error }: IProps) {
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

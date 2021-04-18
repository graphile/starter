import { SyncOutlined } from "@ant-design/icons";
import { ApolloError } from "@apollo/client";
import { Alert, Button, Result } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import React from "react";

export interface ErrorAlertProps {
  error: ApolloError | Error;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  const code: string | undefined = (error as any)?.networkError?.result
    ?.errors?.[0]?.code;
  if (code === "EBADCSRFTOKEN") {
    return (
      <Result
        status="403"
        title="Invalid CSRF token"
        subTitle={
          <>
            <Paragraph type="secondary">
              Our security protections have failed to authenticate your request;
              to solve this you need to refresh the page:
            </Paragraph>
            <Paragraph>
              <Button
                type="primary"
                onClick={() => window.location.reload()}
                icon={<SyncOutlined />}
              >
                Refresh page
              </Button>
            </Paragraph>
          </>
        }
      />
    );
  }
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

import { ApolloError } from "@apollo/client";
import { Alert, Anchor, Button, Text } from "@mantine/core";
import React from "react";
import { AiOutlineSync } from "react-icons/ai";

export interface ErrorAlertProps {
  error: ApolloError | Error;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  const code: string | undefined = (error as any)?.networkError?.result
    ?.errors?.[0]?.code;
  if (code === "EBADCSRFTOKEN") {
    return (
      <Alert title={"Invalid CSRF token"} color={"red"}>
        <Text>
          Our security protections have failed to authenticate your request; to
          solve this you need to refresh the page:
        </Text>
        <Text>
          <Button
            onClick={() => window.location.reload()}
            leftIcon={<AiOutlineSync />}
          >
            Refresh page
          </Button>
        </Text>
      </Alert>
    );
  }
  return (
    <Alert title={"Unexpected error occurred"} color={"red"}>
      <Text>
        <span>
          We're really sorry, but an unexpected error occurred. Please{" "}
          <Anchor href="/">return to the homepage</Anchor> and try again.
        </span>
      </Text>
      <Text color={"red"}>{error.message}</Text>
    </Alert>
  );
}

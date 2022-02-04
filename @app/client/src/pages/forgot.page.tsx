import { Alert, Button, Text, TextInput } from "@mantine/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { ApolloError } from "@apollo/client";
import { useForgotPasswordMutation, useSharedQuery } from "@app/graphql";
import { useForm } from "@mantine/hooks";
import { extractError, getCodeFromError } from "@app/lib";
import { AuthRestrict, Link, SharedLayout } from "@app/client/src/components";

export { Page };

function Page() {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const query = useSharedQuery();
  const [forgotPassword] = useForgotPasswordMutation();
  const [successfulEmail, setSuccessfulEmail] = useState<string | null>(null);

  const form = useForm({
    initialValues: { email: "" },
    validationRules: { email: (value) => /^\S+@\S+$/.test(value) },
    errorMessages: { email: "Invalid email" },
  });

  const focusElement = useRef<HTMLInputElement>(null);
  useEffect(
    () => void (focusElement.current && focusElement.current!.focus()),
    [focusElement]
  );

  const handleSubmit = useCallback(
    (values: typeof form.values): void => {
      form.resetErrors();
      (async () => {
        try {
          const email = values.email;
          await forgotPassword({
            variables: {
              email,
            },
          });
          // Success: refetch
          setSuccessfulEmail(email);
        } catch (e) {
          setError(e);
        }
      })();
    },
    [forgotPassword, setError]
  );

  const code = getCodeFromError(error);

  if (successfulEmail != null) {
    return (
      <SharedLayout title="Forgot Password" query={query}>
        <Alert color={"teal"} title={"You've got mail"}>
          We've sent an email reset link to '{successfulEmail}'; click the link
          and follow the instructions. If you don't receive the link, please
          ensure you entered the email address correctly, and check in your spam
          folder just in case.
        </Alert>
      </SharedLayout>
    );
  }

  const errMsg = error ? (
    <span>
      {extractError(error).message}
      {code ? (
        <span>
          {" "}
          (Error code: <code>ERR_{code}</code>)
        </span>
      ) : null}
    </span>
  ) : null;

  return (
    <SharedLayout
      title="Forgot Password"
      query={query}
      forbidWhen={AuthRestrict.LOGGED_IN}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          required
          label="Email"
          autoComplete={"off"}
          placeholder="your@email.com"
          error={errMsg}
          ref={focusElement}
          icon={<AiOutlineUser />}
          {...form.getInputProps("email")}
        />
        <Button
          type="submit"
          sx={{
            display: "flex",
            flexFlow: "row wrap",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 16,
            marginTop: 16,
          }}
        >
          Submit
        </Button>
        <Text sx={{ marginTop: 16 }}>
          <Link href={"/login"}>Remembered your password? Log in.</Link>
        </Text>
      </form>
    </SharedLayout>
  );
}

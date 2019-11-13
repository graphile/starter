import React, { useCallback, useState, useEffect } from "react";
import get from "lodash/get";
import { Alert, Form, Button, Input } from "antd";
import SharedLayout, { Row, Col } from "../components/SharedLayout";
import { useResetPasswordMutation } from "@app/graphql";
import { P } from "../components/Text";

interface IProps {
  userId: string;
  token: string | null;
}

function Page({ userId: rawUserId, token: rawToken }: IProps) {
  const [[userId, token], setIdAndToken] = useState<[number, string]>([
    parseInt(rawUserId, 10) || 0,
    rawToken || "",
  ]);

  const [resetPassword] = useResetPasswordMutation();

  const [state, setState] = useState<"PENDING" | "SUBMITTING" | "SUCCESS">(
    "PENDING"
  );
  const [error, setError] = useState<Error | null>(null);
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (state === "SUBMITTING") {
      setError(null);
      (async () => {
        try {
          const result = await resetPassword({
            variables: {
              userId,
              token,
              password,
            },
          });
          if (get(result, "data.resetPassword.success")) {
            setState("SUCCESS");
          } else {
            setState("PENDING");
            setError(new Error("Incorrect token, please check and try again"));
          }
        } catch (e) {
          setError(e);
          setState("PENDING");
        }
      })();
    }
  }, [userId, token, state, resetPassword, password]);
  function form() {
    return (
      <Form onSubmit={() => setState("SUBMITTING")}>
        <Form.Item label="Enter your reset token:">
          <Input
            type="text"
            value={token}
            onChange={e => setIdAndToken([userId, e.target.value])}
          />
        </Form.Item>
        <Form.Item label="Choose a new password:">
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </Form.Item>
        {error ? (
          <P>
            {" "}
            <Alert
              type="error"
              closable
              onClose={clearError}
              message={error.message || error}
            />
          </P>
        ) : null}
        <div>
          <Button htmlType="submit">Reset password</Button>
        </div>
      </Form>
    );
  }
  return (
    <SharedLayout title="Reset Password">
      <Row>
        <Col>
          {state === "PENDING" ? (
            form()
          ) : state === "SUBMITTING" ? (
            "Submitting..."
          ) : state === "SUCCESS" ? (
            <Alert
              type="success"
              message="Password Reset"
              description="Your password was reset; you can go and log in now"
            />
          ) : (
            "Unknown state"
          )}
        </Col>
      </Row>
    </SharedLayout>
  );
}

Page.getInitialProps = ({
  query = {},
}: {
  query: { [key: string]: string };
}) => {
  return { userId: query["user_id"], token: query["token"] };
};

export default Page;

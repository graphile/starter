/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import * as React from "react";
import get from "lodash/get";
import { Alert } from "antd";
import SharedLayout, { Row, Col } from "../components/SharedLayout";
import { useResetPasswordMutation } from "../graphql";

interface IProps {
  userId: string;
  token: string | null;
}

function Page({ userId: rawUserId, token: rawToken }: IProps) {
  const [[userId, token], setIdAndToken] = React.useState<[number, string]>([
    parseInt(rawUserId, 10) || 0,
    rawToken || "",
  ]);

  const [resetPassword] = useResetPasswordMutation();

  const [state, setState] = React.useState<
    "PENDING" | "SUBMITTING" | "SUCCESS"
  >("PENDING");
  const [error, setError] = React.useState<Error | null>(null);
  const [password, setPassword] = React.useState<string>("");

  React.useEffect(() => {
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
      <form onSubmit={() => setState("SUBMITTING")}>
        <p>Please enter your reset token</p>
        <input
          type="text"
          value={token}
          onChange={e => setIdAndToken([userId, e.target.value])}
        />
        <p>And choose a new password</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error ? <p>{error.message || error}</p> : null}
        <div>
          <button>Submit</button>
        </div>
      </form>
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

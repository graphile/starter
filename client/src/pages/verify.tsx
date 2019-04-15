import * as React from "react";
import get from "lodash/get";
import SharedLayout, { Row, Col } from "../components/SharedLayout";
import {
  withVerifyEmailMutation,
  VerifyEmailMutationMutationFn,
} from "../generated/graphql";

interface IProps {
  id: string;
  token: string | null;
  verifyEmail: VerifyEmailMutationMutationFn;
}

function Page(props: IProps) {
  const [[id, token], setIdAndToken] = React.useState<[number, string]>([
    parseInt(props.id, 10) || 0,
    props.token || "",
  ]);
  const [state, setState] = React.useState<
    "PENDING" | "SUBMITTING" | "SUCCESS"
  >(props.id && props.token ? "SUBMITTING" : "PENDING");
  const [error, setError] = React.useState<Error | null>(null);
  React.useEffect(() => {
    if (state === "SUBMITTING") {
      setError(null);
      props
        .verifyEmail({
          variables: {
            id,
            token,
          },
        })
        .then(result => {
          if (get(result, "data.verifyEmail.success")) {
            setState("SUCCESS");
          } else {
            setState("PENDING");
            setError(new Error("Incorrect token, please check and try again"));
          }
        })
        .catch((e: Error) => {
          setError(e);
          setState("PENDING");
        });
    }
  }, [id, token, state]);
  function form() {
    return (
      <form onSubmit={() => setState("SUBMITTING")}>
        <p>Please enter your email verification code</p>
        <input
          type="text"
          value={token}
          onChange={e => setIdAndToken([id, e.target.value])}
        />
        {error ? <p>{error.message || error}</p> : null}
        <button>Submit</button>
      </form>
    );
  }
  return (
    <SharedLayout title="Verify Email Address">
      <Row>
        <Col>
          {state === "PENDING"
            ? form()
            : state === "SUBMITTING"
            ? "Submitting..."
            : state === "SUCCESS"
            ? "Success!"
            : "Unknown state"}
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
  return { id: query["id"], token: query["token"] };
};

export default withVerifyEmailMutation<IProps>({
  name: "verifyEmail",
})(Page);

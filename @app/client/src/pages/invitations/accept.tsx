import * as React from "react";
import { Row, Alert, Col, Spin, Button } from "antd";
import SharedLayout from "../../layout/SharedLayout";
import { NextPage } from "next";
import {
  useInvitationDetailQuery,
  useAcceptOrganizationInviteMutation,
} from "@app/graphql";
import { ErrorAlert } from "@app/components";
import { getCodeFromError } from "../../errors";
import Router from "next/router";

interface IProps {
  id: number | null;
  code: string | null;
}

enum Status {
  PENDING = "PENDING",
  ACCEPTING = "ACCEPTING",
}

const InvitationAccept: NextPage<IProps> = props => {
  const { id: rawId, code } = props;
  const id = rawId || 0;
  const { data, loading, error } = useInvitationDetailQuery({
    variables: {
      id,
      code,
    },
    skip: !id,
  });

  const [acceptInvite] = useAcceptOrganizationInviteMutation();

  const [status, setStatus] = React.useState(Status.PENDING);
  const [acceptError, setAcceptError] = React.useState<Error | null>(null);

  const organization = data?.getOrganizationForInvitation;
  const handleAccept = React.useCallback(() => {
    if (!organization) {
      return;
    }
    setStatus(Status.ACCEPTING);
    // Call mutation
    acceptInvite({
      variables: {
        id,
        code,
      },
    }).then(
      () => {
        // Redirect
        Router.push(`/o/${organization.slug}`);
      },
      e => {
        setStatus(Status.PENDING);
        setAcceptError(e);
      }
    );
  }, [acceptInvite, code, id, organization]);

  let child: JSX.Element | null = null;
  if (status === Status.ACCEPTING) {
    child = <Spin />;
  } else if (error || acceptError) {
    const code = getCodeFromError(error || acceptError);
    if (code === "NTFND") {
      child = (
        <Alert
          message="That invitation could not be found"
          description="Perhaps you have already accepted it?"
          type="error"
        ></Alert>
      );
    } else {
      child = <ErrorAlert error={error || acceptError!} />;
    }
  } else if (organization) {
    child = (
      <div>
        <div>You were invited to {organization.name}</div>
        <Button onClick={handleAccept}>Accept invitation</Button>
      </div>
    );
  } else if (loading) {
    child = <Spin />;
  } else {
    child = (
      <Alert
        message="Something went wrong"
        description="We couldn't find details about this invite, please try again later"
        type="error"
      ></Alert>
    );
  }
  return (
    <SharedLayout title="Home">
      <Row>
        <Col>{child}</Col>
      </Row>
    </SharedLayout>
  );
};

InvitationAccept.getInitialProps = async ({ query: { id, code } }) => ({
  id: typeof id === "string" ? parseInt(id, 10) || null : null,
  code: typeof code === "string" ? code : null,
});

export default InvitationAccept;

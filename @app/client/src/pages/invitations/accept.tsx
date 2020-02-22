import React, { FC } from "react";
import { Row, Alert, Col, Spin, Button } from "antd";
import { SharedLayout } from "@app/components";
import { NextPage } from "next";
import {
  useInvitationDetailQuery,
  useAcceptOrganizationInviteMutation,
  SharedLayout_UserFragment,
  InvitationDetailQuery,
  InvitationDetailQueryVariables,
} from "@app/graphql";
import { ErrorAlert, Redirect } from "@app/components";
import { getCodeFromError } from "@app/lib";
import Router, { useRouter, NextRouter } from "next/router";
import * as qs from "querystring";
import { QueryResult } from "@apollo/react-common";

interface IProps {
  id: string | null;
  code: string | null;
}

enum Status {
  PENDING = "PENDING",
  ACCEPTING = "ACCEPTING",
}

const InvitationAccept: NextPage<IProps> = props => {
  const router: NextRouter | null = useRouter();
  const fullHref =
    router.pathname +
    (router && router.query ? `?${qs.stringify(router.query)}` : "");
  const { id: rawId, code } = props;
  const id = rawId || "";
  const query = useInvitationDetailQuery({
    variables: {
      id,
      code,
    },
    skip: !id,
  });
  return (
    <SharedLayout title="Accept Invitation" query={query}>
      {({ currentUser, error, loading }) =>
        !currentUser && !error && !loading ? (
          <Redirect href={`/login?next=${encodeURIComponent(fullHref)}`} />
        ) : (
          <Row>
            <Col>
              <InvitationAcceptInner
                currentUser={currentUser}
                id={id}
                code={code}
                query={query}
              />
            </Col>
          </Row>
        )
      }
    </SharedLayout>
  );
};

interface InvitationAcceptInnerProps extends IProps {
  currentUser?: SharedLayout_UserFragment | null;
  query: QueryResult<InvitationDetailQuery, InvitationDetailQueryVariables>;
}

const InvitationAcceptInner: FC<InvitationAcceptInnerProps> = props => {
  const { id, code, query } = props;

  const { data, loading, error } = query;
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
  return child;
};

InvitationAccept.getInitialProps = async ({ query: { id, code } }) => ({
  id: typeof id === "string" ? id : null,
  code: typeof code === "string" ? code : null,
});

export default InvitationAccept;

"use client";
import { QueryResult } from "@apollo/client";
import {
  AuthRestrict,
  ButtonLink,
  ErrorAlert,
  Redirect,
  SharedLayout,
  SpinPadded,
} from "@/appcomponents";
import {
  InvitationDetailQuery,
  InvitationDetailQueryVariables,
  SharedLayout_UserFragment,
  useAcceptOrganizationInviteMutation,
  useInvitationDetailQuery,
} from "@/appgraphqlgenerated";
import { getCodeFromError } from "@/applib";
import { Button, Col, Result, Row, Skeleton } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useFullHref } from "@/appcomponents/useFullHref";
import React, { FC, Suspense } from "react";

interface IProps {
  id: string | null;
  code: string | null;
}

enum Status {
  PENDING = "PENDING",
  ACCEPTING = "ACCEPTING",
}

const InvitationAccept: FC<IProps> = (props) => {
  const fullHref = useFullHref();
  const { id: rawId, code } = props;
  const id = rawId || "";
  const query = useInvitationDetailQuery({
    variables: {
      id,
      code,
    },
    skip: !id,
    fetchPolicy: "network-only",
  });
  return (
    <SharedLayout
      title="Accept Invitation"
      query={query}
      noHandleErrors
      forbidWhen={AuthRestrict.LOGGED_OUT}
    >
      {({ currentUser, error, loading }) =>
        !currentUser && !error && !loading ? (
          <Redirect href={`/login?next=${encodeURIComponent(fullHref)}`} />
        ) : (
          <Row>
            <Col flex={1}>
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

const InvitationAcceptInner: FC<InvitationAcceptInnerProps> = (props) => {
  const fullHref = useFullHref();
  const { id, code, query } = props;
  const router = useRouter();

  const { data, loading, error } = query;
  const [acceptInvite] = useAcceptOrganizationInviteMutation();

  const [status, setStatus] = React.useState(Status.PENDING);
  const [acceptError, setAcceptError] = React.useState<Error | null>(null);

  const organization = data?.organizationForInvitation;
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
        router.push(`/o/${organization.slug}`);
      },
      (e) => {
        setStatus(Status.PENDING);
        setAcceptError(e);
      }
    );
  }, [router, acceptInvite, code, id, organization]);

  let child: React.JSX.Element | null = null;
  if (status === Status.ACCEPTING) {
    child = <SpinPadded />;
  } else if (error || acceptError) {
    const code = getCodeFromError(error || acceptError);
    if (code === "NTFND") {
      child = (
        <Result
          status="404"
          title="That invitation could not be found"
          subTitle="Perhaps you have already accepted it?"
        />
      );
    } else if (code === "DNIED") {
      child = (
        <Result
          status="403"
          title="That invitation is not for you"
          subTitle="Perhaps you should log out and log in with a different account?"
        />
      );
    } else if (code === "LOGIN") {
      child = (
        <Result
          status="403"
          title="Log in to accept invitation"
          extra={
            <ButtonLink href={`/login?next=${encodeURIComponent(fullHref)}`}>
              Log in
            </ButtonLink>
          }
        />
      );
    } else {
      child = <ErrorAlert error={error || acceptError!} />;
    }
  } else if (organization) {
    child = (
      <Result
        status="success"
        title={`You were invited to ${organization.name}`}
        extra={
          <Button onClick={handleAccept} type="primary">
            Accept invitation
          </Button>
        }
      />
    );
  } else if (loading) {
    child = <Skeleton />;
  } else {
    child = (
      <Result
        status="error"
        title="Something went wrong"
        subTitle="We couldn't find details about this invite, please try again later"
      />
    );
  }
  return child;
};

function InvitationAcceptPage() {
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const code = searchParams.get("code");

  return <InvitationAccept id={id} code={code} />;
}

export default function InvitationAcceptPageWrapper() {
  return (
    <Suspense>
      <InvitationAcceptPage />
    </Suspense>
  );
}

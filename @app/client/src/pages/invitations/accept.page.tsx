import { QueryResult } from "@apollo/client";
import {
  AuthRestrict,
  ButtonLink,
  ErrorAlert,
  Redirect,
  SharedLayout,
  SpinPadded,
} from "@app/client/src/components";
import { Result } from "@app/client/src/components/Results";
import { PageContext } from "@app/client/src/renderer/types";
import { usePageContext } from "@app/client/src/renderer/usePageContext";
import {
  InvitationDetailQuery,
  InvitationDetailQueryVariables,
  SharedLayout_UserFragment,
  useAcceptOrganizationInviteMutation,
  useInvitationDetailQuery,
} from "@app/graphql";
import { getCodeFromError } from "@app/lib";
import { Button, Grid, Skeleton } from "@mantine/core";
import React from "react";
import {
  navigate,
  PageContextBuiltInClient,
} from "vite-plugin-ssr/client/router";

export { Page };

enum Status {
  PENDING = "PENDING",
  ACCEPTING = "ACCEPTING",
}

const Page: React.FC = () => {
  const {
    url,
    urlParsed: {
      // @ts-ignore
      search: { id: rawId, code },
    },
  } = usePageContext() as Partial<
    PageContextBuiltInClient &
      PageContext & { urlParsed: { search: Record<string, string> } }
  >;
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
          <Redirect href={`/login?next=${encodeURIComponent(url!)}`} />
        ) : (
          <Grid>
            <Grid.Col span={12}>
              <InvitationAcceptInner
                currentUser={currentUser}
                id={id}
                code={code}
                query={query}
              />
            </Grid.Col>
          </Grid>
        )
      }
    </SharedLayout>
  );
};

interface InvitationAcceptInnerProps {
  id: string | null;
  code: string | null;
  currentUser?: SharedLayout_UserFragment | null;
  query: QueryResult<InvitationDetailQuery, InvitationDetailQueryVariables>;
}
const InvitationAcceptInner: React.FC<InvitationAcceptInnerProps> = (props) => {
  const { id, code, query } = props;
  const { url } = usePageContext();

  const { data, loading, error } = query;
  const [acceptInvite] = useAcceptOrganizationInviteMutation();

  const [status, setStatus] = React.useState(Status.PENDING);
  const [acceptError, setAcceptError] = React.useState<Error | null>(null);

  const organization = data?.organizationForInvitation;
  const handleAccept = React.useCallback(async () => {
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
        navigate(`/o/${organization.slug}`);
      },
      (e) => {
        setStatus(Status.PENDING);
        setAcceptError(e);
      }
    );
  }, [acceptInvite, code, id, organization]);

  let child: JSX.Element | null = null;
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
            <ButtonLink
              href={`/login?next=${encodeURIComponent(url as string)}`}
            >
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
        extra={<Button onClick={handleAccept}>Accept invitation</Button>}
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

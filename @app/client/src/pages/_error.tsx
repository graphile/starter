import * as React from "react";
import { NextPage } from "next";
import { Alert, Row, Col } from "antd";
import Link from "next/link";
import SharedLayout from "../components/SharedLayout";
import { H2, P } from "../components/Text";

const isDev = process.env.NODE_ENV !== "production";

function FourOhFour() {
  return (
    <div>
      <H2>Page Not Found</H2>
      <P>
        The page you attempted to load was not found. Please check the URL and
        try again, or visit{" "}
        <Link href="/">
          <a>the homepage</a>
        </Link>
      </P>
    </div>
  );
}

function ErrorOccurred() {
  return (
    <div>
      <H2>Something Went Wrong</H2>
      <P>
        We're not sure what happened there; how embarassing! Please try again
        later, or if this keeps happening then let us know.
      </P>
      <P>
        <Link href="/">
          <a>Go to the homepage</a>
        </Link>
      </P>
    </div>
  );
}

function SocialAuthError({ provider }: { provider: string }) {
  return (
    <div>
      <H2>This application is not configured for that auth provider</H2>
      <P>
        Please try and{" "}
        <Link href="/login">
          <a>login with another method</a>
        </Link>
        .
      </P>
      {isDev && (
        <Alert
          type="info"
          message="Development Only Error"
          description={
            <div>
              You seem to be trying to log in with the '<code>{provider}</code>'
              OAuth provider. You should check that{" "}
              <code>{`${provider}_key`.toUpperCase()}</code> and any other
              required variables are set in your environment (e.g.{" "}
              <code>.env</code> file). If they are, check the provider is
              configured in{" "}
              <code>@app/server/src/middleware/installPassport.ts</code>
            </div>
          }
        />
      )}
    </div>
  );
}

interface ErrorPageProps {
  statusCode: number | null;
  pathname: string | null;
}

interface ComponentAndTitle {
  Component: React.FC<{}>;
  title: string;
}

const getDisplayForError = (props: ErrorPageProps): ComponentAndTitle => {
  const { statusCode, pathname } = props;

  const authMatches = pathname ? pathname.match(/^\/auth\/([a-z]+)/) : null;
  if (authMatches) {
    const CurriedSocialAuthError = () => (
      <SocialAuthError provider={authMatches[1]} />
    );
    return {
      Component: CurriedSocialAuthError,
      title: "Application not configured for this auth provider",
    };
  }

  switch (statusCode) {
    case 404:
      return {
        Component: FourOhFour,
        title: "Page Not Found",
      };
    default:
      return {
        Component: ErrorOccurred,
        title: "An Error Occurred",
      };
  }
};

const ErrorPage: NextPage<ErrorPageProps> = props => {
  const { Component, title } = getDisplayForError(props);
  return (
    <SharedLayout title={title}>
      <Row>
        <Col>
          <Component />
        </Col>
      </Row>
    </SharedLayout>
  );
};

ErrorPage.getInitialProps = async ({ res, err, asPath }) => ({
  pathname: asPath || null,
  statusCode: res ? res.statusCode : err ? err["statusCode"] || null : null,
});

export default ErrorPage;

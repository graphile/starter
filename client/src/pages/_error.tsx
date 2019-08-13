/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import * as React from "react";
import { NextPageContext } from "next";
import { Alert, Row, Col } from "antd";
import Link from "next/link";
import SharedLayout from "../components/SharedLayout";

const isDev = process.env.NODE_ENV !== "production";

function FourOhFour() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>
        The page you attempted to load was not found. Please check the URL and
        try again, or visit{" "}
        <Link href="/">
          <a>the homepage</a>
        </Link>
      </p>
    </div>
  );
}

function ErrorOccurred() {
  return (
    <div>
      <h2>Something Went Wrong</h2>
      <p>
        We're not sure what happened there; how embarassing! Please try again
        later, or if this keeps happening then let us know.
      </p>
      <p>
        <Link href="/">
          <a>Go to the homepage</a>
        </Link>
      </p>
    </div>
  );
}

function SocialAuthError({ provider }: { provider: string }) {
  return (
    <div>
      <h2>This application is not configured for that auth provider</h2>
      <p>
        Please try and{" "}
        <Link href="/login">
          <a>login with another method</a>
        </Link>
        .
      </p>
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
              <code>backend/src/server/middleware/installPassport.ts</code>
            </div>
          }
        />
      )}
    </div>
  );
}

interface ErrorPageProps {
  statusCode: number;
  pathname: string;
}

export default function ErrorPage(props: ErrorPageProps) {
  const { statusCode, pathname } = props;
  const authMatches = pathname && pathname.match(/^\/auth\/([a-z]+)/);
  const errorCode = authMatches ? "SOCIAL_AUTH" : statusCode;
  const [Component, title, moreProps = {}] = {
    SOCIAL_AUTH: [
      SocialAuthError,
      "Application not configured for this auth provider",
      { provider: authMatches && authMatches[1] },
    ],
    404: [FourOhFour, "Page Not Found"],
  }[errorCode] || [ErrorOccurred, "An Error Occurred"];
  return (
    <SharedLayout title={title}>
      <Row>
        <Col>
          <Component {...props} {...moreProps} />
        </Col>
      </Row>
    </SharedLayout>
  );
}

ErrorPage.getInitialProps = ({ res, err, asPath }: NextPageContext) => ({
  pathname: asPath,
  statusCode: res ? res.statusCode : err ? err["statusCode"] : null,
});

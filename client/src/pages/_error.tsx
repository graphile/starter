import * as React from "react";
import SharedLayout, { Row, Col, Link } from "../components/SharedLayout";

function FourOhFour() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>
        The page you attempted to load was not found. Please check the URL and
        try again, or visit <Link href="/">the homepage</Link>
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
        <Link href="/">Go to the homepage</Link>
      </p>
    </div>
  );
}

export default function ErrorPage(props) {
  const [Component, title] = {
    404: [FourOhFour, "Page Not Found"],
  }[props.statusCode] || [ErrorOccurred, "An Error Occurred"];
  return (
    <SharedLayout title={title}>
      <Row>
        <Col>
          <Component {...props} />
        </Col>
      </Row>
    </SharedLayout>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => ({
  statusCode: res ? res.statusCode : err ? err.statusCode : null,
});

import React from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useOrganizationPageQuery } from "@app/graphql";
import SharedLayout from "../../layout/SharedLayout";
import { Spin, Row, Col } from "antd";
import { ErrorAlert } from "@app/components";

const OrganizationPage: NextPage = () => {
  const router = useRouter();
  const { slug: rawSlug } = router.query;
  const slug = String(rawSlug);

  const { data, loading, error } = useOrganizationPageQuery({
    variables: {
      slug,
    },
  });

  let child: JSX.Element | null = null;
  const organization = data?.organizationBySlug;
  if (organization) {
    child = <div>This is the page for '{organization.name}'</div>;
  } else if (loading) {
    child = <Spin />;
  } else if (error) {
    child = <ErrorAlert error={error} />;
  } else {
    // TODO: 404
    child = <div>404</div>;
  }
  return (
    <SharedLayout title={organization?.name ?? slug}>
      <Row>
        <Col>{child}</Col>
      </Row>
    </SharedLayout>
  );
};

export default OrganizationPage;

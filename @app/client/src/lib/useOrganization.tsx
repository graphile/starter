import React from "react";
import { useRouter } from "next/router";
import { useOrganizationPageQuery } from "@app/graphql";
import { Spin, Row, Col } from "antd";
import { ErrorAlert } from "@app/components";

const useOrganization = () => {
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
    //child = <OrganizationPageInner organization={organization} />;
  } else if (loading) {
    child = <Spin />;
  } else if (error) {
    child = <ErrorAlert error={error} />;
  } else {
    // TODO: 404
    child = <div>404</div>;
  }

  return {
    organization,
    fallbackChild: child ? (
      <Row>
        <Col>{child}</Col>
      </Row>
    ) : null,
    slug,
  };
};

export default useOrganization;

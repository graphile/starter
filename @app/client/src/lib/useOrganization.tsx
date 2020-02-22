import React from "react";
import { useRouter } from "next/router";
import { OrganizationPage_QueryFragment } from "@app/graphql";
import { Spin, Row, Col } from "antd";
import { ErrorAlert } from "@app/components";
import { QueryResult } from "@apollo/react-common";

export function useOrganizationSlug() {
  const router = useRouter();
  const { slug: rawSlug } = router.query;
  return String(rawSlug);
}

export function useOrganizationLoading(
  query: Pick<
    QueryResult<OrganizationPage_QueryFragment>,
    "data" | "loading" | "error" | "networkStatus" | "client" | "refetch"
  >
) {
  const { data, loading, error } = query;

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

  return child ? (
    <Row>
      <Col>{child}</Col>
    </Row>
  ) : null;
}

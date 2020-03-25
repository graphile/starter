import { QueryResult } from "@apollo/react-common";
import { OrganizationPage_QueryFragment } from "@app/graphql";
import { Col, Row, Spin } from "antd";
import { useRouter } from "next/router";
import React from "react";

import { ErrorAlert, FourOhFour } from "./";

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
    child = <FourOhFour />;
  }

  return child ? (
    <Row>
      <Col>{child}</Col>
    </Row>
  ) : null;
}

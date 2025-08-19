"use client";
import { QueryResult } from "@apollo/client";
import { OrganizationPage_QueryFragment } from "@/appgraphqlgenerated";
import { Col, Row } from "antd";
import { useParams } from "next/navigation";
import React from "react";

import { ErrorAlert, FourOhFour } from "./index";
import { SpinPadded } from "./SpinPadded";

export function useOrganizationSlug() {
  const params = useParams();
  const rawSlug = params.slug;
  return String(rawSlug);
}

export function useOrganizationLoading(
  query: Pick<
    QueryResult<OrganizationPage_QueryFragment>,
    "data" | "loading" | "error" | "networkStatus" | "client" | "refetch"
  >
) {
  const { data, loading, error } = query;

  let child: React.JSX.Element | null = null;
  const organization = data?.organizationBySlug;
  if (organization) {
    //child = <OrganizationPageInner organization={organization} />;
  } else if (loading) {
    child = <SpinPadded />;
  } else if (error) {
    child = <ErrorAlert error={error} />;
  } else {
    // TODO: 404
    child = <FourOhFour currentUser={data?.currentUser} />;
  }

  return child ? (
    <Row>
      <Col flex={1}>{child}</Col>
    </Row>
  ) : null;
}

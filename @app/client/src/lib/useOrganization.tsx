import React from "react";
import { useRouter } from "next/router";
import {
  OrganizationPageQueryVariables,
  OrganizationPageDocument,
  OrganizationPage_QueryFragment,
} from "@app/graphql";
import { Spin, Row, Col } from "antd";
import { ErrorAlert } from "@app/components";
import { useQuery } from "@apollo/react-hooks";
import { DocumentNode } from "graphql";

function useOrganization<
  TData extends OrganizationPage_QueryFragment = OrganizationPage_QueryFragment,
  TVariables extends OrganizationPageQueryVariables = OrganizationPageQueryVariables
>(
  queryDocument: DocumentNode = OrganizationPageDocument,
  variables?: Omit<TVariables, "slug">
) {
  const router = useRouter();
  const { slug: rawSlug } = router.query;
  const slug = String(rawSlug);

  const query = useQuery<TData, any>(queryDocument, {
    variables: {
      ...variables,
      slug,
    },
  });
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

  return {
    query,
    organization,
    fallbackChild: child ? (
      <Row>
        <Col>{child}</Col>
      </Row>
    ) : null,
    slug,
  };
}

export default useOrganization;

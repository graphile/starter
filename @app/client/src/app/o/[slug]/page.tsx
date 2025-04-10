"use client";
import { PageHeader } from "@ant-design/pro-layout";
import {
  ButtonLink,
  SharedLayout,
  useOrganizationLoading,
  useOrganizationSlug,
} from "@/appcomponents";
import {
  OrganizationPage_OrganizationFragment,
  useOrganizationPageQuery,
} from "@/appgraphqlgenerated";
import { Col, Empty, Row } from "antd";
import React, { FC } from "react";

export default function OrganizationPage() {
  const slug = useOrganizationSlug();
  const query = useOrganizationPageQuery({ variables: { slug } });
  const organizationLoadingElement = useOrganizationLoading(query);
  const organization = query?.data?.organizationBySlug;

  return (
    <SharedLayout
      title={`${organization?.name ?? slug}`}
      titleHref={`/o/[slug]`}
      titleHrefAs={`/o/${slug}`}
      query={query}
    >
      {organizationLoadingElement || (
        <OrganizationPageInner organization={organization!} />
      )}
    </SharedLayout>
  );
}

interface OrganizationPageInnerProps {
  organization: OrganizationPage_OrganizationFragment;
}

const OrganizationPageInner: FC<OrganizationPageInnerProps> = (props) => {
  const { organization } = props;

  return (
    <Row>
      <Col flex={1}>
        <div>
          <PageHeader
            title={"Dashboard"}
            extra={
              organization.currentUserIsBillingContact ||
                organization.currentUserIsOwner
                ? [
                  <ButtonLink
                    key="settings"
                    href={`/o/[slug]/settings`}
                    as={`/o/${organization.slug}/settings`}
                    type="primary"
                    data-cy="organizationpage-button-settings"
                  >
                    Settings
                  </ButtonLink>,
                ]
                : null
            }
          />
          <Empty
            description={
              <span>
                Customize this page in
                <br />
                <code>@app/client/src/pages/o/[slug]/index.tsx</code>
              </span>
            }
          />
        </div>
      </Col>
    </Row>
  );
};

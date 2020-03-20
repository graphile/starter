import {
  H1,
  Link,
  SharedLayout,
  useOrganizationLoading,
  useOrganizationSlug,
} from "@app/components";
import {
  OrganizationPage_OrganizationFragment,
  useOrganizationPageQuery,
} from "@app/graphql";
import { Col, Row } from "antd";
import { NextPage } from "next";
import React, { FC } from "react";

const OrganizationPage: NextPage = () => {
  const slug = useOrganizationSlug();
  const query = useOrganizationPageQuery({ variables: { slug } });
  const organizationLoadingElement = useOrganizationLoading(query);
  const organization = query?.data?.organizationBySlug;

  return (
    <SharedLayout title={organization?.name ?? slug} query={query}>
      {organizationLoadingElement || (
        <OrganizationPageInner organization={organization!} />
      )}
    </SharedLayout>
  );
};

interface OrganizationPageInnerProps {
  organization: OrganizationPage_OrganizationFragment;
}

const OrganizationPageInner: FC<OrganizationPageInnerProps> = props => {
  const { organization } = props;

  return (
    <Row>
      <Col>
        <div>
          <H1>{organization.name}</H1>
          {organization.currentUserIsBillingContact ||
          organization.currentUserIsOwner ? (
            <p>
              <Link href={`/o/${organization.slug}/settings`}>
                <a>Settings</a>
              </Link>
            </p>
          ) : null}
          <p>Hello</p>
        </div>
      </Col>
    </Row>
  );
};

export default OrganizationPage;

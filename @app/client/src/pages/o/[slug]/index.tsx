import React, { FC } from "react";
import { NextPage } from "next";
import { OrganizationPageOrganizationFragment } from "@app/graphql";
import SharedLayout, { Link } from "../../../layout/SharedLayout";
import { Row, Col } from "antd";
import { H1 } from "@app/components";
import useOrganization from "../../../lib/useOrganization";

const OrganizationPage: NextPage = () => {
  const { organization, fallbackChild, slug, query } = useOrganization();
  return (
    <SharedLayout title={organization?.name ?? slug} query={query}>
      {fallbackChild || <OrganizationPageInner organization={organization!} />}
    </SharedLayout>
  );
};

interface OrganizationPageInnerProps {
  organization: OrganizationPageOrganizationFragment;
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

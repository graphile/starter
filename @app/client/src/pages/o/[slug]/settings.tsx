import React, { FC } from "react";
import { NextPage } from "next";
import { OrganizationPageOrganizationFragment } from "@app/graphql";
import SharedLayout from "../../../layout/SharedLayout";
import { Row, Col } from "antd";
import { H1, Redirect } from "@app/components";
import useOrganization from "../../../lib/useOrganization";

const OrganizationSettingsPage: NextPage = () => {
  const { organization, fallbackChild, slug } = useOrganization();
  return (
    <SharedLayout title={organization?.name ?? slug}>
      <Row>
        <Col>
          {fallbackChild || (
            <OrganizationSettingsPageInner organization={organization!} />
          )}
        </Col>
      </Row>
    </SharedLayout>
  );
};

interface OrganizationSettingsPageInnerProps {
  organization: OrganizationPageOrganizationFragment;
}

const OrganizationSettingsPageInner: FC<OrganizationSettingsPageInnerProps> = props => {
  const { organization } = props;
  if (
    !organization.currentUserIsBillingContact &&
    !organization.currentUserIsOwner
  ) {
    return <Redirect href={`/o/${organization.slug}`} />;
  }

  return (
    <div>
      <H1>{organization.name} Settings</H1>
      <p>Welcome to settings</p>
    </div>
  );
};

export default OrganizationSettingsPage;

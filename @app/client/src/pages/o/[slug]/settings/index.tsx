import React, { FC } from "react";
import { NextPage } from "next";
import { OrganizationPageOrganizationFragment } from "@app/graphql";
import SharedLayout from "../../../../layout/SharedLayout";
import { H1, Redirect } from "@app/components";
import useOrganization from "../../../../lib/useOrganization";
import OrganizationSettingsLayout from "../../../../layout/OrganizationSettingsLayout";

const OrganizationSettingsPage: NextPage = () => {
  const { organization, fallbackChild, slug, query } = useOrganization();
  return (
    <SharedLayout title={organization?.name ?? slug} noPad query={query}>
      {fallbackChild || (
        <OrganizationSettingsPageInner organization={organization!} />
      )}
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
    <OrganizationSettingsLayout
      organization={organization}
      href={`/o/${organization.slug}/settings`}
    >
      <div>
        <H1>{organization.name} Settings</H1>
        <p>Welcome to settings</p>
      </div>
    </OrganizationSettingsLayout>
  );
};

export default OrganizationSettingsPage;

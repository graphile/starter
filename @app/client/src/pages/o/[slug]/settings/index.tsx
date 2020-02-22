import React, { FC } from "react";
import { NextPage } from "next";
import {
  OrganizationPage_OrganizationFragment,
  useOrganizationPageQuery,
} from "@app/graphql";
import { SharedLayout } from "@app/components";
import { H1, Redirect } from "@app/components";
import { useOrganizationSlug, useOrganizationLoading } from "@app/lib";
import { OrganizationSettingsLayout } from "@app/components";

const OrganizationSettingsPage: NextPage = () => {
  const slug = useOrganizationSlug();
  const query = useOrganizationPageQuery({ variables: { slug } });
  const organizationLoadingElement = useOrganizationLoading(query);
  const organization = query?.data?.organizationBySlug;

  return (
    <SharedLayout title={organization?.name ?? slug} noPad query={query}>
      {organizationLoadingElement || (
        <OrganizationSettingsPageInner organization={organization!} />
      )}
    </SharedLayout>
  );
};

interface OrganizationSettingsPageInnerProps {
  organization: OrganizationPage_OrganizationFragment;
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

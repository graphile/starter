import {
  ButtonLink,
  Empty,
  PageHeader,
  SharedLayout,
  useOrganizationLoading,
  useOrganizationSlug,
} from "@app/client/src/components";
import {
  OrganizationPage_OrganizationFragment,
  useOrganizationPageQuery,
} from "@app/graphql";
import { Grid } from "@mantine/core";
import React from "react";

export { Page };

const Page: React.FC = () => {
  const slug = useOrganizationSlug();
  const query = useOrganizationPageQuery({ variables: { slug } });
  const organizationLoadingElement = useOrganizationLoading(query);
  const organization = query?.data?.organizationBySlug;

  return (
    <SharedLayout
      title={`${organization?.name ?? slug}`}
      titleHref={`/o/${slug}`}
      query={query}
    >
      {organizationLoadingElement || (
        <OrganizationPageInner organization={organization!} />
      )}
    </SharedLayout>
  );
};

interface OrganizationPageInnerProps {
  organization: OrganizationPage_OrganizationFragment;
}

const OrganizationPageInner: React.FC<OrganizationPageInnerProps> = (props) => {
  const { organization } = props;

  return (
    <Grid>
      <Grid.Col span={12}>
        <div>
          <PageHeader
            title={"Dashboard"}
            extra={
              organization.currentUserIsBillingContact ||
              organization.currentUserIsOwner
                ? [
                    <ButtonLink
                      key="settings"
                      href={`/o/${organization.slug}/settings`}
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
      </Grid.Col>
    </Grid>
  );
};

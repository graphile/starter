import { Link, Outlet, useLocation } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { Layout, Menu, Typography } from "antd";
import type { TextProps } from "antd/lib/typography/Text";

import { StandardWidth, Warn } from "~/components";
import { useUser } from "~/utils/hooks";
import { requireUser } from "~/utils/users";

import { contentMinHeight } from "../__index";

const { Text } = Typography;
const { Sider, Content } = Layout;

export const handle = { noPad: true };

export const loader = async ({ request, context }: LoaderArgs) => {
  await requireUser(request, context);
  return null;
};

interface PageSpec {
  title: string;
  cy: string;
  warnIfUnverified?: boolean;
  titleProps?: TextProps;
}

// TypeScript shenanigans (so we can still use `keyof typeof pages` later)
function page(spec: PageSpec): PageSpec {
  return spec;
}

const pages = {
  "/settings": page({
    title: "Profile",
    cy: "settingslayout-link-profile",
  }),
  "/settings/security": page({
    title: "Passphrase",
    cy: "settingslayout-link-password",
  }),
  "/settings/accounts": page({
    title: "Linked Accounts",
    cy: "settingslayout-link-accounts",
  }),
  "/settings/emails": page({
    title: "Emails",
    warnIfUnverified: true,
    cy: "settingslayout-link-emails",
  }),
  "/settings/delete": page({
    title: "Delete Account",
    titleProps: {
      type: "danger",
    },
    cy: "settingslayout-link-delete",
  }),
};

export default function Settings() {
  const currentUser = useUser();
  const location = useLocation();
  const locationPathname = location.pathname;
  // const selectedKeys = Object.keys(pages).filter((pageHref) => {
  //   const path = useResolvedPath(pageHref);
  //   let toPathname = path.pathname;

  //   const isActive =
  //     locationPathname === toPathname ||
  //     (locationPathname.startsWith(toPathname) &&
  //       locationPathname.charAt(toPathname.length) === "/");
  //   return isActive;
  // });
  return (
    <Layout style={{ minHeight: contentMinHeight }} hasSider>
      <Sider>
        <Menu selectedKeys={[locationPathname]}>
          {Object.entries(pages).map(
            ([pageHref, { cy, title, titleProps, warnIfUnverified }]) => (
              <Menu.Item key={pageHref}>
                <Link to={pageHref} data-cy={cy}>
                  <Warn
                    okay={
                      !currentUser ||
                      currentUser.isVerified ||
                      !warnIfUnverified
                    }
                  >
                    <Text {...titleProps}>{title}</Text>
                  </Warn>
                </Link>
              </Menu.Item>
            )
          )}
        </Menu>
      </Sider>
      <Content>
        <StandardWidth>
          <Outlet />
        </StandardWidth>
      </Content>
    </Layout>
  );
}

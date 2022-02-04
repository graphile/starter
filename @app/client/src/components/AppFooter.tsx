import { Anchor, Text } from "@mantine/core";
import React from "react";

import { appConfig } from "../helpers";

const { companyName } = appConfig;

export function AppFooter() {
  return (
    <div
      id={"footer"}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}
    >
      <Text>
        Copyright &copy; {new Date().getFullYear()} {companyName}. All rights
        reserved.
        {import.meta.env.T_AND_C_URL ? (
          <span>
            {" "}
            <Anchor
              style={{ textDecoration: "underline" }}
              href={import.meta.env.T_AND_C_URL as string}
            >
              Terms and conditions
            </Anchor>
          </span>
        ) : null}
      </Text>
      <Text>
        Powered by{" "}
        <Anchor
          sx={{ textDecoration: "underline" }}
          href="https://graphile.org/postgraphile"
        >
          PostGraphile
        </Anchor>
      </Text>
    </div>
  );
}

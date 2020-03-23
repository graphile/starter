import { Empty } from "antd";
import Link from "next/link";
import React from "react";

import { H4, P } from "./Text";

export function FourOhFour() {
  return (
    <div>
      <Empty
        style={{ marginTop: "2rem" }}
        description={<H4>Page Not Found</H4>}
      >
        <P>
          The page you attempted to load was not found.
          <br />
          Please check the URL and try again, or visit{" "}
          <Link href="/">
            <a>the homepage</a>
          </Link>
        </P>
      </Empty>
    </div>
  );
}

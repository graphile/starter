import { Result } from "antd";
import React from "react";

import { ButtonLink } from "./ButtonLink";

export function FourOhFour() {
  return (
    <div>
      <Result
        status="404"
        title="404"
        subTitle="The page you attempted to load was not found. Maybe you need to log in?"
        extra={
          <ButtonLink type="primary" href="/">
            Back Home
          </ButtonLink>
        }
      />
    </div>
  );
}

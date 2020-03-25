import { User } from "@app/graphql";
import { Result } from "antd";
import React from "react";

import { ButtonLink } from "./ButtonLink";

interface FourOhFourProps {
  currentUser?: Pick<User, "id"> | null;
}
export function FourOhFour(props: FourOhFourProps) {
  const { currentUser } = props;
  return (
    <div data-cy="fourohfour-div">
      <Result
        status="404"
        title="404"
        subTitle={`The page you attempted to load was not found.${
          currentUser ? "" : " Maybe you need to log in?"
        }`}
        extra={
          <ButtonLink type="primary" href="/">
            Back Home
          </ButtonLink>
        }
      />
    </div>
  );
}

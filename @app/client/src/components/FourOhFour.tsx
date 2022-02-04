import { Heading } from "@app/client/src/components/Text";
import type { User } from "@app/graphql";
import { Box } from "@mantine/core";
import React from "react";

import { ButtonLink } from "./ButtonLink";

interface FourOhFourProps {
  currentUser?: Pick<User, "id"> | null;
}
export function FourOhFour(props: FourOhFourProps) {
  const { currentUser } = props;
  return (
    <div data-cy="fourohfour-div">
      <Heading>404</Heading>
      <Heading order={3}>{`The page you attempted to load was not found.${
        currentUser ? "" : " Maybe you need to log in?"
      }`}</Heading>
      <Box>
        <ButtonLink href="/">Back Home</ButtonLink>
      </Box>
    </div>
  );
}

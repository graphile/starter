import { Button, ButtonProps } from "@mantine/core";
import React from "react";

export function ButtonLink(props: ButtonProps<'a'>) {
  const { href, ...rest } = props;
  return (
      <Button component={"a"} href={href} {...rest} />
  );
}

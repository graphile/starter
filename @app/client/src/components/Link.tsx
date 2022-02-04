import { usePageContext } from "@app/client/src/renderer/usePageContext";
import { Anchor, AnchorProps } from "@mantine/core";
import React from "react";

export function Link(props: Omit<AnchorProps<any>, "defaultProps">) {
  const { urlPathname } = usePageContext();
  const { href, ...rest } = props;
  const className = [props.className, urlPathname === href && "is-active"]
    .filter(Boolean)
    .join(" ");
  return <Anchor href={href} {...rest} className={className} />;
}

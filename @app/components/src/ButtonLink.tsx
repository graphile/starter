import { Button } from "antd";
import { ButtonProps } from "antd/lib/button";
import Link from "next/link";
import React from "react";

export function ButtonLink(props: ButtonProps & { href: string }) {
  const { href, ...rest } = props;
  return (
    <Link href={href}>
      <Button {...rest} />
    </Link>
  );
}

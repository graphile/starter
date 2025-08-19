import { Button } from "antd";
import { ButtonProps } from "antd/lib/button";
import Link from "next/link";
import React from "react";

export function ButtonLink(props: ButtonProps & { href: string; as?: string }) {
  const { href, as, ...rest } = props;
  return (
    <Link href={href} as={as}>
      <Button {...rest} />
    </Link>
  );
}

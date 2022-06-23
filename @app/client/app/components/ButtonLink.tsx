import { Link } from "@remix-run/react";
import { Button } from "antd";
import type { ButtonProps } from "antd/lib/button";

export function ButtonLink(props: ButtonProps & { href: string; as?: string }) {
  const { href, as, ...rest } = props;
  return (
    <Link to={href}>
      <Button {...rest} />
    </Link>
  );
}

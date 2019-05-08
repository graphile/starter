/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import React from "react";
import { Badge } from "antd";

interface WarnProps {
  children: React.ReactNode;
  okay?: boolean;
}

export default function Warn({ children, okay }: WarnProps) {
  return okay ? (
    <span>{children}</span>
  ) : (
    <span>
      <Badge dot>{children}</Badge>
    </span>
  );
}

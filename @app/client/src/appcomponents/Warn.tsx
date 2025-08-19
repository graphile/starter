import { Badge } from "antd";
import React from "react";

export interface WarnProps extends React.ComponentProps<typeof Badge> {
  children: React.ReactNode;
  okay?: boolean;
}

export function Warn({ children, okay, ...props }: WarnProps) {
  return okay ? (
    <span>{children}</span>
  ) : (
    <span>
      <Badge dot {...props}>
        {children}
      </Badge>
    </span>
  );
}

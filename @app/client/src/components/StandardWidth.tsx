import React, { FC } from "react";

export interface StandardWidthProps {
  children: React.ReactNode;
}

export const StandardWidth: FC<StandardWidthProps> = ({ children }) => (
  <div style={{ padding: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
    {children}
  </div>
);

import React, { FC } from "react";
import { Row, Col } from "antd";

export interface StandardWidthProps {
  children: React.ReactNode;
}

export const StandardWidth: FC<StandardWidthProps> = ({ children }) => (
  <Row style={{ padding: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
    <Col>{children}</Col>
  </Row>
);

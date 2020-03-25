import { Col, Row } from "antd";
import React, { FC } from "react";

export interface StandardWidthProps {
  children: React.ReactNode;
}

export const StandardWidth: FC<StandardWidthProps> = ({ children }) => (
  <Row style={{ padding: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
    <Col flex={1}>{children}</Col>
  </Row>
);

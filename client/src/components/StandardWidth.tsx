/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import React from "react";
import { Row, Col } from "antd";

const StandardWidth = ({ children }: { children: React.ReactNode }) => (
  <Row style={{ padding: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
    <Col>{children}</Col>
  </Row>
);
export default StandardWidth;

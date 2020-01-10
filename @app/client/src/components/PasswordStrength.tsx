import React, { useEffect, useState } from "react";
import { Progress, Popover, Icon, Col, Row } from "antd";

interface PassProps {
  passwordStrength: number;
  suggestions: string[];
  isDirty: boolean;
}

function strengthToPercent(strength: number): number {
  // passwordStrength is a value 0-4
  return (strength + 1) * 2 * 10;
}

export default function PasswordStrength({
                                           passwordStrength,
                                           suggestions = [
                                             "Use a few words, avoid common phrases",
                                             "No need for symbols, digits, or uppercase letters",
                                           ],
                                           isDirty = false,
                                         }: PassProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isDirty || suggestions.length > 0) {
      setVisible(true);
    }
  }, [suggestions]);

  if (!isDirty) return null;

  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const content = (
    <ul>
      {suggestions.map((suggestion, key) => {
        return <li key={key}>{suggestion}</li>;
      })}
    </ul>
  );

  return (
    <Row>
      <Col span={8} />
      <Col span={15}>
        <Progress
          percent={strengthToPercent(passwordStrength)}
          status={passwordStrength < 2 ? "exception" : undefined}
        />
      </Col>
      <Col span={1} style={{ textAlign: "right" }}>
        <Popover
          placement="right"
          title={"Password Hints"}
          content={content}
          trigger="click"
          visible={visible}
          onVisibleChange={handleVisibleChange}
        >
          <Icon type="info-circle" />
        </Popover>
      </Col>
    </Row>
  );
}

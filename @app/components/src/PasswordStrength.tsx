import { InfoCircleOutlined } from "@ant-design/icons";
import { Col, Popover, Progress, Row } from "antd";
import React, { useEffect, useState } from "react";

export interface PasswordStrengthProps {
  passwordStrength: number;
  suggestions: string[];
  isDirty: boolean;
  isFocussed: boolean;
}

function strengthToPercent(strength: number): number {
  // passwordStrength is a value 0-4
  return (strength + 1) * 2 * 10;
}

export function PasswordStrength({
  passwordStrength,
  suggestions = [
    "Use a few words, avoid common phrases",
    "No need for symbols, digits, or uppercase letters",
  ],
  isDirty = false,
  isFocussed = false,
}: PasswordStrengthProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Auto-display popup
    if (isFocussed && isDirty && suggestions.length > 0) {
      setVisible(true);
    }
    // Auto-hide when there's no suggestions
    if (suggestions.length === 0) {
      setVisible(false);
    }
  }, [isDirty, isFocussed, suggestions]);

  // Blur on password field focus loss
  useEffect(() => {
    if (!isFocussed) {
      setVisible(false);
    }
  }, [isFocussed]);

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
    <Row style={{ lineHeight: "2rem" }}>
      <Col span={20} offset={1}>
        <Progress
          percent={strengthToPercent(passwordStrength)}
          status={passwordStrength < 2 ? "exception" : undefined}
        />
      </Col>
      <Col span={3}>
        <Popover
          placement="bottomRight"
          title={"Password Hints"}
          content={content}
          trigger="click"
          visible={visible}
          onVisibleChange={handleVisibleChange}
        >
          <div
            style={{
              width: "100%",
              textAlign: "right",
              padding: "0 13px",
            }}
          >
            <InfoCircleOutlined
              style={suggestions.length > 0 ? {} : { visibility: "hidden" }}
            />
          </div>
        </Popover>
      </Col>
    </Row>
  );
}

import React from "react";
import { Button } from "antd";

interface SocialLoginOptionsProps {
  next: string;
  buttonTextFromService(service: string): string;
}

function defaultButtonTextFromService(service: string) {
  return `Login with ${service}`;
}

export default function SocialLoginOptions({
  next,
  buttonTextFromService = defaultButtonTextFromService,
}: SocialLoginOptionsProps) {
  return (
    <Button
      block
      type="primary"
      size="large"
      icon="github"
      href={`/auth/github?next=${next}`}
    >
      {buttonTextFromService("GitHub")}
    </Button>
  );
}

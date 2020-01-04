import React from "react";
import { Button } from "antd";

export interface SocialLoginOptionsProps {
  next: string;
  buttonTextFromService?: (service: string) => string;
}

function defaultButtonTextFromService(service: string) {
  return `Sign in with ${service}`;
}

export function SocialLoginOptions({
  next,
  buttonTextFromService = defaultButtonTextFromService,
}: SocialLoginOptionsProps) {
  return (
    <Button block size="large" icon="github" href={`/auth/github?next=${next}`}>
      {buttonTextFromService("GitHub")}
    </Button>
  );
}

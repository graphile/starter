import { Button } from "@mantine/core";
import React from "react";
import { AiOutlineGithub } from "react-icons/ai";

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
    <Button
      component={"a"}
      fullWidth
      size="lg"
      leftIcon={<AiOutlineGithub />}
      href={`/auth/github?next=${encodeURIComponent(next)}`}
    >
      {buttonTextFromService("GitHub")}
    </Button>
  );
}

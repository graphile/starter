import { Link } from "@remix-run/react";
import { FaGithub } from "react-icons/fa";

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
    <Link
      className="btn btn-primary"
      to={`/auth/github?next=${encodeURIComponent(next)}`}
    >
      <span className="mx-1 text-lg tems-center flex">
        <FaGithub />
      </span>
      {buttonTextFromService("GitHub")}
    </Link>
  );
}

import React, { useEffect } from "react";
import Router from "next/router";

export interface RedirectProps {
  href: string;
}

export function Redirect({ href }: RedirectProps) {
  useEffect(() => {
    Router.push(href);
  }, [href]);
  return <div>Redirecting...</div>;
}

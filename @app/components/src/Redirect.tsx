import Router from "next/router";
import React, { useEffect } from "react";

export interface RedirectProps {
  href: string;
}

export function Redirect({ href }: RedirectProps) {
  useEffect(() => {
    Router.push(href);
  }, [href]);
  return <div>Redirecting...</div>;
}

import React, { useEffect } from "react";
import Router from "next/router";

interface RedirectProps {
  href: string;
}

export default function Redirect({ href }: RedirectProps) {
  useEffect(() => {
    Router.push(href);
  }, [href]);
  return <div>Redirecting...</div>;
}

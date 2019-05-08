/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
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

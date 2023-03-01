import Link from "next/link";
import React from "react";

import { H2, P } from "./Text";

export function ErrorOccurred() {
  return (
    <div>
      <H2>Something Went Wrong</H2>
      <P>
        We&apos;re not sure what happened there; how embarrassing! Please try
        again later, or if this keeps happening then let us know.
      </P>
      <P>
        <Link href="/">Go to the homepage</Link>
      </P>
    </div>
  );
}

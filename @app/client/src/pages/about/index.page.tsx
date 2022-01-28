import "./index.css";

import React from "react";
import { Helmet } from "react-helmet-async";

export { Page };

function Page() {
  return (
    <>
      <Helmet>
        <title>About page title in helmet</title>
      </Helmet>
      <h1>About</h1>
      <p>A colored page.</p>
    </>
  );
}

import { Container } from "@mantine/core";
import React from "react";
import { Helmet } from "react-helmet-async";

import { Counter } from "./Counter";

export { Page };

function Page() {
  return (
    <Container>
      <Helmet>
        <title>Index page title in helmet</title>
      </Helmet>
      <h1>Welcome</h1>
      This page is:
      <ul>
        <li>Rendered to HTML.</li>
        <li>
          Interactive. <Counter />
        </li>
      </ul>
    </Container>
  );
}

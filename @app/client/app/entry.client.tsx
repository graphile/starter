import { RemixBrowser } from "@remix-run/react";
import { hydrate } from "react-dom";

function Client() {
  return <RemixBrowser />;
}

hydrate(<Client />, document);

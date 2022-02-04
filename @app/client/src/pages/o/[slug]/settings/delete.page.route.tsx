import { PageContext } from "@app/client/src/renderer/types";
import { PageContextBuiltInClient } from "vite-plugin-ssr/client/router/index";

export default (pageContext: PageContextBuiltInClient & PageContext) => {
  const { url } = pageContext;
  const rx = /\/o\/[-\w]+\/settings\/delete$/;
  if (!rx.test(url)) {
    return false;
  }
  const slug = url.split("/")[2];
  return {
    routeParams: { slug },
    precedence: 10,
  };
};

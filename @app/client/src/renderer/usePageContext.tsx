// `usePageContext` allows us to access `pageContext` in any React component.
// More infos: https://vite-plugin-ssr.com/pageContext-anywhere

import React, { useContext } from "react";
import { PageContextBuiltIn } from "vite-plugin-ssr";
import { PageContextBuiltInClient } from "vite-plugin-ssr/client/router/index";

import type { PageContext } from "./types";

export { PageContextProvider };
export { usePageContext };

const Context = React.createContext<
  (Partial<PageContextBuiltInClient> | Partial<PageContextBuiltIn>) &
    PageContext
>(undefined as any);

function PageContextProvider({
  pageContext,
  children,
}: {
  pageContext: PageContext &
    (Partial<PageContextBuiltInClient> | Partial<PageContextBuiltIn>);
  children: React.ReactNode;
}) {
  return <Context.Provider value={pageContext}>{children}</Context.Provider>;
}

function usePageContext() {
  return useContext(Context);
}

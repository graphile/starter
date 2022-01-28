import { ApolloClient } from "@apollo/client";
import { FilledContext } from "react-helmet-async";

export type PageProps = {};
// The `pageContext` that are available in both on the server-side and browser-side
export type PageContext = {
  Page: (pageProps: PageProps) => React.ReactElement;
  pageProps: PageProps;
  urlPathname: string;
  documentProps?: {
    title?: string;
    description?: string;
  };
  ROOT_URL: string;
  csrfToken: string;
  apolloClient: ApolloClient<any>;
  apolloInitialState: any;
  helmetContext: FilledContext;
  renderedStyles: string;
};

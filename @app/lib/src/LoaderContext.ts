import { getSdk } from "@app/graphql";

export interface LoaderContext {
  cspNonce: string;
  csrfToken: string;
  graphqlSdk: Promise<ReturnType<typeof getSdk>>;
  validateCsrfToken: (token: string) => boolean;
}

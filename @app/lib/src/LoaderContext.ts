import { getSdk } from "@app/graphql";

// NOTE: this must be kept in sync with @app/client/@types/context.d.ts

export interface LoaderContext {
  // Necessary for compatibility with AppLoadContext assignment
  [key: string]: unknown;

  cspNonce: string;
  csrfToken: string;
  graphqlSdk: Promise<ReturnType<typeof getSdk>>;
  validateCsrfToken: (token: string) => boolean;
}

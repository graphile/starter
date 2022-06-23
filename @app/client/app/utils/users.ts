import type { LoaderContext } from "@app/lib";

import { redirectTyped } from "~/utils/remix-typed";

export async function requireNoUser(context: LoaderContext) {
  const sdk = await context.graphqlSdk;
  const { currentUser } = await sdk.Shared();
  if (currentUser != null) {
    throw redirectTyped("/");
  }
  return null;
}

export async function requireUser(
  request: Request,
  context: LoaderContext,
  redirectTo: string = new URL(request.url).pathname
) {
  const sdk = await context.graphqlSdk;
  const { currentUser } = await sdk.Shared();
  if (currentUser == null) {
    throw redirectTyped(`/login?next=${encodeURIComponent(redirectTo)}`);
  }
  return null;
}

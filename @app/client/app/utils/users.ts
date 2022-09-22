import type { LoaderContext } from "@app/lib";
import { redirect } from "@remix-run/server-runtime";

export async function requireNoUser(context: LoaderContext) {
  const sdk = await context.graphqlSdk;
  const { currentUser } = await sdk.Shared();
  if (currentUser != null) {
    throw redirect("/");
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
    throw redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  }
  return null;
}

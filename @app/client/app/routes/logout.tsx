import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";

import { validateCsrfToken } from "~/utils/csrf";

export const action = async ({ request, context }: ActionArgs) => {
  await validateCsrfToken(request, context);
  const sdk = await context.graphqlSdk;
  await sdk.Logout();
  return redirect("/");
};

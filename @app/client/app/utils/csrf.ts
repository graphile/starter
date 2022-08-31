import type { LoaderContext } from "@app/lib";
import { json } from "@remix-run/node";
import type { ThrownResponse } from "@remix-run/react";

export type CsrfErrorResponse = ThrownResponse<422, string>;

export function unprocessableEntity<Data = unknown>(data: Data) {
  return json<Data>(data, { status: 422 });
}

export async function validateCsrfToken(
  request: Request,
  context: LoaderContext,
  sessionKey = "csrf"
) {
  if (request.bodyUsed) {
    throw new Error(
      "The body of the request was read before calling verifyAuthenticityToken. Ensure you clone it before reading it."
    );
  }
  // We clone the request to ensure we don't modify the original request. This
  // allow us to parse the body of the request and let the original request
  // still be used and parsed without errors.
  const formData = await request.clone().formData();

  const formToken = formData.get(sessionKey) as string | undefined;

  // if the body doesn't have a csrf token, throw an error
  if (!formToken) {
    throw unprocessableEntity({
      message: "Can't find CSRF token in body.",
    });
  }

  // if the body csrf token doesn't match the session csrf token, throw an error
  if (!context.validateCsrfToken(formToken)) {
    throw unprocessableEntity({
      message: "Can't verify CSRF token authenticity.",
    });
  }
}

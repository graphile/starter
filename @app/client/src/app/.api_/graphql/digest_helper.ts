import {
  processHeaders,
  RequestDigest,
  NormalizedRequestDigest,
} from "postgraphile/grafserv";
import { NextRequest } from "next/server";
import { normalizeRequest } from "postgraphile/grafserv";

/**
 * Create a NormalizedRequestDigest with all of the values needed
 */
export function getNormalizedDigest(req: NextRequest): NormalizedRequestDigest {
  const digest: RequestDigest = {
    httpVersionMajor: 1, // Default HTTP version
    httpVersionMinor: 1, // Default HTTP version
    isSecure: req.nextUrl.protocol === "https:", // Determine if the request is secure
    method: req.method, // HTTP method
    path: req.nextUrl.pathname, // Request path
    headers: processHeaders(Object.fromEntries(req.headers.entries())), // Normalize headers
    getQueryParams: () =>
      Object.fromEntries(req.nextUrl.searchParams.entries()), // Query parameters
    async getBody() {
      const body = await req.text();
      const json = body ? JSON.parse(body) : {}; // Empty object if the body is empty
      // console.log("json", json);
      return { type: "json", json };
    },
    requestContext: {},
  };
  // console.log("digest", digest);
  return normalizeRequest(digest);
}

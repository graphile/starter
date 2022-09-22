import type { User } from "@app/graphql";
import { useMatches } from "@remix-run/react";
import type { SerializeFrom } from "@remix-run/server-runtime";
import { useMemo } from "react";

import type { loader } from "~/root";

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
function useMatchesData<T = Record<string, unknown>>(
  id: string
): T | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data as unknown as T;
}

export function useMatchesDataTyped<DataFunction>(id: string) {
  return useMatchesData<SerializeFrom<DataFunction>>(id);
}

export function useRootMatchesData() {
  return useMatchesDataTyped<typeof loader>("root")!;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.name === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useRootMatchesData();
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

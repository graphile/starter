export function isSafe(nextUrl: string | null): nextUrl is string {
  return (nextUrl && nextUrl[0] === "/") || false;
}

/**
 * Accepts a `value` that may or may not be an array.
 * If it is, returns the first item from that array;
 * if not, returns the value unchanged.
 */
export function firstIfArray<T>(value: T[] | T | undefined) {
  if (typeof value === "undefined") {
    return value;
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

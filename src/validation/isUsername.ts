/**
 * Checks if a passed value is a string,
 * and if it is composed of only valid
 * characters. Returns a boolean.
 */
export function isUsername(value: string): boolean {
  if (typeof value !== 'string') return false;
  return /^[a-z0-9]+[\w\-_]+[a-z0-9]+$/.test(value);
}

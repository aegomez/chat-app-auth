/**
 * Checks if a passed value is a string,
 * and if it is composed of only valid
 * characters. Returns a boolean.
 */
export const isUsername = (value: string): boolean => {
  if (typeof value !== 'string') return false;
  return /^[A-Za-z0-9]+[\w\-_]+[A-Za-z0-9]+$/.test(value);
};

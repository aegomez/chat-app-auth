// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toString(value: any): string {
  return typeof value === 'string' ? value : '';
}

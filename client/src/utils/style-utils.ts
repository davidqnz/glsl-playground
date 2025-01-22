export function classes(...classes: Array<string | unknown>): string {
  return classes.filter((c) => !!c).join(" ");
}

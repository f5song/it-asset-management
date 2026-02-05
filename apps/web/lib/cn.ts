export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export function cnGrid(...cls: (string | undefined | false)[]) {
  return cls.filter(Boolean).join(" ");
}
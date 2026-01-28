// src/lib/utils/filters.ts
export const toUndef = <T extends string | undefined>(v: T | ""): T | undefined =>
  v === "" ? undefined : v;


export const toUndefTrim = (v?: string | null): string | undefined => {
  if (v == null) return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
};


/** สร้าง normalizer จาก mapping (Label -> canonical) */
export const normalizeByMap =
  (map: Record<string, string>) =>
  (v?: string): string => {
    if (!v) return "";
    return map[v] ?? v.toString();
  };
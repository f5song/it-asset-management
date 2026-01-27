// src/lib/utils/filters.ts
export const toUndef = <T extends string | undefined>(v: T | ""): T | undefined =>
  v === "" ? undefined : v;

/** สร้าง normalizer จาก mapping (Label -> canonical) */
export const normalizeByMap =
  (map: Record<string, string>) =>
  (v?: string): string => {
    if (!v) return "";
    return map[v] ?? v.toString();
  };
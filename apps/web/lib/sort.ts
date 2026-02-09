// src/lib/table/sort.ts
export type PriorityOrder = readonly string[];

/**
 * เรียงลำดับแบบ "เสถียร" (stable) โดยใช้ priority ของ key หลักก่อน
 * แล้วตามด้วย secondary key (เช่น employeeId) หรือคงลำดับเดิม
 */
export function stableSortByPriorityThen<T>(
  list: readonly T[],
  getPrimaryKey: (item: T) => string | undefined,       // เช่น r.status
  priority: PriorityOrder,                               // เช่น ["Active", "Resigned"]
  getSecondaryKey?: (item: T) => string | number | Date | undefined, // เช่น r.employeeId
): T[] {
  const prIndex = (v?: string) => {
    const i = priority.indexOf(v ?? "");
    return i >= 0 ? i : Number.MAX_SAFE_INTEGER; // ค่าที่ไม่อยู่ใน priority จะไปท้าย
  };

  const cmpSecondary = (a: any, b: any) => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    // number
    if (typeof a === "number" && typeof b === "number") return a - b;

    // date
    const da = new Date(a);
    const db = new Date(b);
    const aIsDate = !isNaN(da.valueOf());
    const bIsDate = !isNaN(db.valueOf());
    if (aIsDate && bIsDate) return da.getTime() - db.getTime();

    // string / อื่น ๆ -> เทียบแบบ numeric-aware
    return String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  return [...list]
    .map((item, idx) => ({ item, idx })) // ทำ stable sort
    .sort((a, b) => {
      const pa = prIndex(getPrimaryKey(a.item));
      const pb = prIndex(getPrimaryKey(b.item));
      if (pa !== pb) return pa - pb;

      if (getSecondaryKey) {
        const sa = getSecondaryKey(a.item);
        const sb = getSecondaryKey(b.item);
        const s = cmpSecondary(sa, sb);
        if (s !== 0) return s;
      }

      // คงลำดับเดิมถ้ายังเท่ากัน
      return a.idx - b.idx;
    })
    .map(x => x.item);
}
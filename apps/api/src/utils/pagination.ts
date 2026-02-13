// src/utils/pagination.ts
export type PagingInput = {
  pageIndex1?: number | string; // 1-based จาก client (อาจมาเป็น string)
  pageSize?: number | string;
  pageSizeDefault?: number;     // default: 20
  pageSizeMax?: number;         // default: 100
};

export type PagingNormalized = {
  pageIndex0: number; // ส่งเข้า service
  pageIndex1: number; // ส่งออกให้ client
  pageSize: number;
  offset: number;
  limit: number;
};

export function normalize1BasedPaging(input: PagingInput): PagingNormalized {
  const pageSizeDefault = input.pageSizeDefault ?? 20;
  const pageSizeMax = input.pageSizeMax ?? 100;

  // แปลงค่าจาก query (อาจเป็น string)
  const p1Raw = typeof input.pageIndex1 === 'string' ? parseInt(input.pageIndex1, 10) : (input.pageIndex1 ?? 1);
  const sizeRaw = typeof input.pageSize === 'string' ? parseInt(input.pageSize, 10) : (input.pageSize ?? pageSizeDefault);

  // ปรับให้อยู่ในช่วงที่ยอมรับได้
  const pageIndex1 = Number.isFinite(p1Raw as number) && (p1Raw as number) > 0 ? (p1Raw as number) : 1;
  const pageSize = Math.min(Math.max(1, sizeRaw as number), pageSizeMax);

  const pageIndex0 = pageIndex1 - 1;
  const offset = pageIndex0 * pageSize;
  const limit = pageSize;

  return { pageIndex0, pageIndex1, pageSize, offset, limit };
}

export type PagingMeta = {
  pageIndex: number; // 1-based
  pageSize: number;
  pageCount: number;
  hasPrev: boolean;
  hasNext: boolean;
};

/**
 * สร้างเมทาดาต้าหน้า (1-based) จากค่ารวม total
 */
export function buildPagingMeta(total: number, pageIndex0: number, pageSize: number): PagingMeta {
  const pageCount = Math.max(1, Math.ceil((total ?? 0) / Math.max(1, pageSize)));
  // บีบ pageIndex0 ไม่ให้เกินขอบเขต (เผื่อ client ส่งเลขหน้าเกิน)
  const safeIndex0 = Math.min(Math.max(0, pageIndex0), Math.max(0, pageCount - 1));
  return {
    pageIndex: safeIndex0 + 1,             // แสดงเป็น 1‑based
    pageSize,
    pageCount,
    hasPrev: safeIndex0 > 0,
    hasNext: safeIndex0 < pageCount - 1,
  };
}

/**
 * ตัวช่วยรวมผลลัพธ์เป็นรูปแบบมาตรฐาน
 */
export function withPaging<T>(items: T[], total: number, pageIndex0: number, pageSize: number) {
  return {
    items,
    total,
    ...buildPagingMeta(total, pageIndex0, pageSize),
  };
}
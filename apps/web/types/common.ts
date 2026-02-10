
// src/types/common.ts

/** ทิศทางการเรียงลำดับ */
export type SortOrder = "asc" | "desc";

/** รูปแบบพารามิเตอร์การแบ่งหน้า (1-based index) */
export type OffsetPaginationParams = {
  page: number;     // เริ่มที่ 1
  pageSize: number; // จำนวนต่อหน้า
  sortBy?: string;
  sortOrder?: SortOrder;
  // เผื่อขยาย key อื่น ๆ แบบปลอดภัย
  [key: string]: unknown;
};

/** รูปแบบผลลัพธ์แบบแบ่งหน้า */
export type OffsetPage<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalPages?: number;
};

/** Alias สำหรับวันที่/เวลาแบบ ISO */
export type ISODateString = string;       // 'YYYY-MM-DD'
export type ISODateTimeString = string;   // 'YYYY-MM-DDTHH:mm:ss.sssZ'

/** breadcrumbs สำหรับ UI */
export type BreadcrumbItem = { label: string; href?: string };

/** option ทั่วไป */
export type OptionItem = { label: string; value: string | number };

/** เหตุการณ์ประวัติ (มาตรฐานเดียวสำหรับทั้งระบบ) */
export type HistoryEvent = {
  id: string;
  timestamp: ISODateTimeString; // ใช้ timestamp เดียวให้ทุกที่
  actor: string;
  action: string;
  detail?: string;
};

export type FilterValues<TStatus extends string = string, TType extends string = string> = {
  status?: TStatus;
  type?: TType;
  manufacturer?: string;
  search?: string;
};


export type Searchable = {
  /** คำค้นหาทั่วไป (เช่น ค้นหา name/manufacturer) */
  search?: string;
};

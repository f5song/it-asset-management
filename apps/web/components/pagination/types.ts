
// src/pagination/types.ts

export type SortOrder = 'asc' | 'desc' | undefined;

export type OffsetPaginationParams = {
  page: number;           // เริ่มที่ 1
  pageSize: number;       // จำนวนต่อหน้า
  sortBy?: string;        // ชื่อคอลัมน์ที่ sort (optional)
  sortOrder?: SortOrder;  // 'asc' | 'desc' (optional)
  // รองรับ filter/query อื่น ๆ
  [key: string]: string | number | boolean | undefined;
};

// โครงผลลัพธ์จาก Backend (แนะนำให้ backend ส่งรูปแบบนี้)
export type OffsetPageResponse<T> = {
  items: T[];             // ข้อมูลรายการของหน้านี้
  totalCount: number;     // จำนวนทั้งหมดในฐานข้อมูล
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  // ถ้ามี totalPages ก็ยิ่งดี (optional)
  totalPages?: number;
};

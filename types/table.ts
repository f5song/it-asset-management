
// src/types/table.ts
export type SortOrder = 'asc' | 'desc';

export type PaginationState = {
  pageIndex: number;  // 0-based index
  pageSize: number;
};

// ใช้ generic T เพื่อให้ sortBy เป็น key ของ type แถวจริง
export type SortingState<T> = {
  sortBy?: keyof T;
  sortOrder?: SortOrder;
};

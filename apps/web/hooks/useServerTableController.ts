// hooks/useServerTableController.ts
"use client";

import React from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { sortingToServer } from "@/lib/sortingToServer";
import type { ServerSort } from "@/types/server-query";
import type { FilterValues } from "types";

/** ---------------------------
 * Controller Return
 * --------------------------*/
type ControllerReturn<SF> = {
  // สำหรับ FilterBar
  simpleFilters: SF;
  onSimpleFiltersChange: (sf: SF) => void;

  // สำหรับ DataTable
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;

  // สำหรับโดเมน service/hook
  serverQuery: {
    pageIndex: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
};

/** ---------------------------
 * V1 (GENERAL) – แนะนำให้ใช้เป็นหลัก
 * ให้ฟีเจอร์กำหนด Simple Filter เอง (จะมี/ไม่มี status ก็ได้)
 * --------------------------*/
export type UseServerTableControllerOptionsV1<
  TRow,
  DF,
  SF
> = {
  pageSize: number;
  defaultSort: { id: keyof TRow | string; desc?: boolean };
  domainFilters: DF;
  setDomainFilters: (next: DF) => void;
  toSimple: (df: DF) => SF;
  fromSimple: (sf: SF) => DF;
  resetDeps?: React.DependencyList;
};

/** ---------------------------
 * V2 (CONVENIENCE) – Backward compatible
 * สำหรับหน้าที่ต้องการใช้ FilterValues<TStatus, TType>
 * --------------------------*/
export type UseServerTableControllerOptionsV2<
  TRow,
  TStatus extends string,
  TType extends string,
  DF
> = {
  pageSize: number;
  defaultSort: { id: keyof TRow | string; desc?: boolean };
  domainFilters: DF;
  setDomainFilters: (next: DF) => void;
  toSimple: (df: DF) => FilterValues<TStatus, TType>;
  fromSimple: (sf: FilterValues<TStatus, TType>) => DF;
  resetDeps?: React.DependencyList;
};

/** ---------------------------
 * รูปแบบหลัก (RECOMMENDED API) – Generic 3 ตัว
 * เทียบกับ V1 แต่ใช้ชื่อกลางให้ชัด: TSimple = simple filter
 * --------------------------*/
export type UseServerTableControllerOptions<
  TRow,
  TSimple,
  DF
> = UseServerTableControllerOptionsV1<TRow, DF, TSimple>;

/** ---------------------------
 * Overloads
 * --------------------------*/
export function useServerTableController<TRow, DF, SF>(
  opts: UseServerTableControllerOptionsV1<TRow, DF, SF>,
): ControllerReturn<SF>;

export function useServerTableController<
  TRow,
  TStatus extends string,
  TType extends string,
  DF
>(
  opts: UseServerTableControllerOptionsV2<TRow, TStatus, TType, DF>,
): ControllerReturn<FilterValues<TStatus, TType>>;

/** ---------------------------
 * Implementation
 * --------------------------*/
export function useServerTableController(opts: any): any {
  const {
    pageSize,
    defaultSort,
    domainFilters,
    setDomainFilters,
    toSimple,
    fromSimple,
    resetDeps = [],
  } = opts;

  // Pagination
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Sorting
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: String(defaultSort.id), desc: !!defaultSort.desc },
  ]);

  // Domain -> Simple (UI)
  const simpleFilters = React.useMemo(
    () => toSimple(domainFilters),
    [domainFilters, toSimple],
  );

  const onSimpleFiltersChange = React.useCallback(
    (sf: any) => setDomainFilters(fromSimple(sf)),
    [fromSimple, setDomainFilters],
  );

  // reset page เมื่อ deps ใน filter เปลี่ยน
  React.useEffect(() => {
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  // query พร้อมส่ง server
  const serverSort: ServerSort = sortingToServer(sorting);
  const serverQuery = React.useMemo(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sortBy: serverSort.sortBy,
      sortOrder: serverSort.sortOrder,
    }),
    [pagination.pageIndex, pagination.pageSize, serverSort.sortBy, serverSort.sortOrder],
  );

  return {
    simpleFilters,
    onSimpleFiltersChange,
    pagination,
    setPagination,
    sorting,
    setSorting,
    serverQuery,
  };
}
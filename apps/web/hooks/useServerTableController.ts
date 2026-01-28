import React from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { FilterValues } from "types/common";
import { ServerSort } from "@/types/server-query";
import { sortingToServer } from "@/lib/sortingToServer";


type UseServerTableControllerOptions<T, FK extends string, FT extends string, DF> = {
  pageSize: number;
  defaultSort: { id: keyof T | string; desc?: boolean };

  domainFilters: DF;
  setDomainFilters: (next: DF) => void;

  toSimple: (df: DF) => FilterValues<FK, FT>;
  fromSimple: (sf: FilterValues<FK, FT>) => DF;

  /** ถ้าฟิลเตอร์/เงื่อนไขเปลี่ยน ให้รีเซ็ต pageIndex = 0 */
  resetDeps?: React.DependencyList;
};

export function useServerTableController<T, FK extends string, FT extends string, DF>(
  opts: UseServerTableControllerOptions<T, FK, FT, DF>
) {
  const { pageSize, defaultSort, domainFilters, setDomainFilters, toSimple, fromSimple, resetDeps = [] } = opts;

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: String(defaultSort.id), desc: !!defaultSort.desc },
  ]);

  // รีเซ็ตหน้าทุกครั้งที่ filters/เงื่อนไขเปลี่ยน
  React.useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  // แปลง filters โดเมน ↔︎ SimpleFilters (สำหรับ FilterBar)
  const simpleFilters = React.useMemo(() => toSimple(domainFilters), [domainFilters, toSimple]);
  const onSimpleFiltersChange = React.useCallback(
    (sf: FilterValues<FK, FT>) => setDomainFilters(fromSimple(sf)),
    [fromSimple, setDomainFilters]
  );

  // query ที่พร้อมส่งไป server
  const serverSort: ServerSort = sortingToServer(sorting);
  const serverQuery = React.useMemo(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sortBy: serverSort.sortBy,
      sortOrder: serverSort.sortOrder,
    }),
    [pagination.pageIndex, pagination.pageSize, serverSort.sortBy, serverSort.sortOrder]
  );

  return {
    // สำหรับ FilterBar
    simpleFilters,
    onSimpleFiltersChange,

    // สำหรับ DataTable
    pagination,
    setPagination,
    sorting,
    setSorting,

    // สำหรับ Hook โดเมนไปยิง API
    serverQuery,
  };
}

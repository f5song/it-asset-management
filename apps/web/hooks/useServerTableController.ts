import React from "react";
import { ServerSort } from "@/types/server-query";
import { sortingToServer } from "@/lib/sortingToServer";
import { PaginationState, SortingState } from "@tanstack/react-table";

/**
 * ตัวเลือกสำหรับควบคุมตารางฝั่งเซิร์ฟเวอร์ (Server-side Table Controller)
 * - TRow: ชนิดของแถว (row) ในตาราง
 * - DF:   ชนิดของ "โดเมนฟิลเตอร์" ที่ฝั่งโดเมนใช้จริง (เช่น { status?: 'active'; search?: string })
 * - SF:   ชนิดของ "ซิมเปิลฟิลเตอร์" ที่ UI/FilterBar ใช้ (เช่น { status?: string; q?: string })
 */
export type UseServerTableControllerOptions<TRow, DF, SF> = {
  /** จำนวนแถวต่อหน้าเริ่มต้น */
  pageSize: number;

  /** ค่าเริ่มต้นของการเรียง (id ของคอลัมน์ และทิศทาง) */
  defaultSort: { id: keyof TRow | string; desc?: boolean };

  /** ฟิลเตอร์โดเมน ณ ปัจจุบัน + setter */
  domainFilters: DF;
  setDomainFilters: (next: DF) => void;

  /** mapping: DF -> SF (เพื่อป้อนให้ FilterBar) */
  toSimple: (df: DF) => SF;

  /** mapping: SF -> DF (เมื่อ FilterBar เปลี่ยนค่า) */
  fromSimple: (sf: SF) => DF;

  /** ถ้าฟิลเตอร์/เงื่อนไขเปลี่ยน ให้รีเซ็ต pageIndex = 0 (ใส่ deps ที่ต้องการเฝ้าดู) */
  resetDeps?: React.DependencyList;
};

/**
 * ฮุคควบคุมการแบ่งหน้า/เรียง/แปลงฟิลเตอร์ และผลิต query สำหรับยิงไป backend
 *
 * ใช้งานหลายโดเมนได้ (device / software / license / ...) โดย:
 * - กำหนด DF (โดเมนฟิลเตอร์) ของโดเมนนั้น
 * - กำหนด SF (ซิมเปิลฟิลเตอร์) สำหรับ UI
 * - ส่งตัวแปลง toSimple / fromSimple ให้ตรงกัน
 */
export function useServerTableController<TRow, DF, SF>(
  opts: UseServerTableControllerOptions<TRow, DF, SF>
) {
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

  // แปลง filters โดเมน ↔︎ SimpleFilters (สำหรับ FilterBar)
  const simpleFilters = React.useMemo(() => toSimple(domainFilters), [domainFilters, toSimple]);

  const onSimpleFiltersChange = React.useCallback(
    (sf: SF) => setDomainFilters(fromSimple(sf)),
    [fromSimple, setDomainFilters]
  );

  // ถ้า deps บางตัวที่เกี่ยวกับฟิลเตอร์เปลี่ยน ให้รีเซ็ตหน้าเป็นหน้าแรก
  React.useEffect(() => {
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

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
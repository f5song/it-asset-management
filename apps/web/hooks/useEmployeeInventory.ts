"use client";

import * as React from "react";
import { listEmployees } from "services/employees.service";
import type {
  EmployeeItem,
  EmployeeDomainFilters,
  EmployeesListQuery,
  EmployeesListResponse,
} from "types/employees";
import type { ServerQuery } from "types/server-query";
import { toUndefTrim } from "@/lib/filters";

type UseEmployeesInventoryResult = {
  rows: EmployeeItem[];
  totalRows: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
};

/**
 * stable sort utility:
 * - เรียงตาม priority ของ primary key ก่อน (เช่น status: Active -> Resigned)
 * - แล้วตามด้วย secondary key (เช่น employeeId) แบบ numeric-aware
 * - คงลำดับเดิม (stable) เมื่อตัวเทียบเท่ากัน
 */
function stableSortByPriorityThen<T>(
  list: readonly T[],
  getPrimaryKey: (item: T) => string | undefined,
  priority: readonly string[],
  getSecondaryKey?: (item: T) => string | number | Date | undefined,
): T[] {
  const prIndex = (v?: string) => {
    const i = priority.indexOf(v ?? "");
    return i >= 0 ? i : Number.MAX_SAFE_INTEGER;
  };

  const cmpSecondary = (a: any, b: any) => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    if (typeof a === "number" && typeof b === "number") return a - b;

    const da = new Date(a);
    const db = new Date(b);
    const aIsDate = !isNaN(da.valueOf());
    const bIsDate = !isNaN(db.valueOf());
    if (aIsDate && bIsDate) return da.getTime() - db.getTime();

    return String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  };

  return [...list]
    .map((item, idx) => ({ item, idx }))
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

      return a.idx - b.idx; // stable
    })
    .map((x) => x.item);
}

/**
 * Hook: ดึงรายการพนักงานตาม server-side pagination/sorting + domain filters
 * - ส่ง sortBy/sortOrder ไป service เหมือนเดิม
 * - เสริม client-side "priority sort" (ในหน้า) เมื่อ sortBy === 'status_priority' และเป็น All Status
 */
export function useEmployeesInventory(
  serverQuery: ServerQuery,
  filters: EmployeeDomainFilters = {},
): UseEmployeesInventoryResult {
  const [rows, setRows] = React.useState<EmployeeItem[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  /**
   * ประกอบ query สำหรับ service (object เสถียร)
   * - pageIndex (0-based) -> page (1-based)
   * - pageSize -> pageSize
   * - แนบ search/status/type
   * - ส่ง sortBy/sortOrder ถ้ามี
   * - ส่ง excludeAssignedForExceptionId -> ให้ backend กรอง "ไม่มี Active assignment"
   * - (mock) แนบ orderByRaw ถ้าจำเป็น
   */
  const serviceQuery = React.useMemo(() => {
    const { pageIndex = 0, pageSize = 10, sortBy, sortOrder } = serverQuery;

    const status = filters.status; // EmployeeStatus | undefined
    const type = toUndefTrim(filters.type);
    const search = toUndefTrim(filters.search) ?? "";

    //   จากหน้า Assign
    const excludeAssignedForExceptionId =
      typeof (filters as any)?.excludeAssignedForExceptionId === "number"
        ? (filters as any).excludeAssignedForExceptionId as number
        : undefined;

    const q: EmployeesListQuery & {
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      orderByRaw?: string[];
      excludeAssignedForExceptionId?: number;
    } = {
      page: pageIndex + 1,  //   1-based
      pageSize,
      search,
      status,
      type: type ?? undefined,
      ...(sortBy ? { sortBy: String(sortBy) } : {}),
      ...(sortOrder ? { sortOrder } : {}),
      ...(typeof excludeAssignedForExceptionId === "number"
        ? { excludeAssignedForExceptionId }
        : {}),
    };

    // FE priority sort (ถ้า backend ยังไม่รองรับ)
    if (sortBy === "status_priority" && !status /* All Status */) {
      const dir = sortOrder === "desc" ? "DESC" : "ASC";
      q.orderByRaw = [
        `CASE status
           WHEN 'Active'   THEN 0
           WHEN 'Resigned' THEN 1
           ELSE 999
         END ${dir}`,
        `employeeId ASC`, // secondary
      ];
    }

    return q;
  }, [
    serverQuery.pageIndex,
    serverQuery.pageSize,
    serverQuery.sortBy,
    serverQuery.sortOrder,
    filters.status,
    filters.type,
    filters.search,
    (filters as any)?.excludeAssignedForExceptionId, //   refetch เมื่อ exception เปลี่ยน
  ]);

  React.useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res: EmployeesListResponse = await listEmployees(
          serviceQuery as any,
          ac.signal,
        );

        if (!alive) return;

        const items = (res as any).items ?? [];
        const total =
          (res as any).totalCount ??
          (res as any).pagination?.total ??
          (res as any).total ??
          0;

        let nextRows: EmployeeItem[] = Array.isArray(items) ? (items as EmployeeItem[]) : [];

        // FE sort สำหรับ status_priority (ถ้า backend ยังไม่รองรับ)
        const isAllStatus = !filters.status;
        const sortBy = (serverQuery as any).sortBy as string | undefined;
        const sortOrder = (serverQuery as any).sortOrder as "asc" | "desc" | undefined;

        if (isAllStatus && sortBy === "status_priority") {
          const PRIORITY = ["Active", "Resigned"] as const;

          nextRows = stableSortByPriorityThen(
            nextRows,
            (r) => r.status,
            PRIORITY,
            (r) => r.id, // secondary
          );

          if (sortOrder === "desc") {
            nextRows = [...nextRows].reverse();
          }
        }

        setRows(nextRows);
        setTotalRows(Number.isFinite(total) ? Number(total) : 0);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        if (!alive) return;
        setError(true);
        setErrorMessage(e?.message ?? "โหลดข้อมูลพนักงานไม่สำเร็จ");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, [
    serviceQuery,
    filters.status,
    serverQuery.sortBy,
    serverQuery.sortOrder,
    (filters as any)?.excludeAssignedForExceptionId, //   เพื่อ refetch
  ]);

  return { rows, totalRows, isLoading, isError, errorMessage };
}
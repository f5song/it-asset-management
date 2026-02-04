"use client";

import * as React from "react";
import { listEmployees } from "services/employees.service.mock";
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
 * Hook: ดึงรายการพนักงานตาม server-side pagination/sorting + domain filters
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
   * - แนบ search/status/department
   * - ส่ง sortBy/sortOrder ถ้ามี
   */
  const serviceQuery = React.useMemo(() => {
    const { pageIndex = 0, pageSize = 10, sortBy, sortOrder } = serverQuery;

    // ✅ status: ใช้ค่าจากฟิลเตอร์ตรง ๆ (คง union type)
    const status = filters.status; // EmployeeStatus | undefined

    // ✅ department/search ค่อย trim
    const department = toUndefTrim(filters.department);
    const search = toUndefTrim(filters.search) ?? "";

    const q: EmployeesListQuery & {
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {
      page: pageIndex + 1,
      pageSize,
      search,
      status, // ✅ OK: EmployeeStatus | undefined
      department: department ?? undefined,
      ...(sortBy ? { sortBy: String(sortBy) } : {}),
      ...(sortOrder ? { sortOrder } : {}),
    };

    return q;
  }, [
    serverQuery.pageIndex,
    serverQuery.pageSize,
    serverQuery.sortBy,
    serverQuery.sortOrder,
    filters.status,
    filters.department,
    filters.search,
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

        setRows(Array.isArray(items) ? (items as EmployeeItem[]) : []);
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
  }, [serviceQuery]);

  return { rows, totalRows, isLoading, isError, errorMessage };
}

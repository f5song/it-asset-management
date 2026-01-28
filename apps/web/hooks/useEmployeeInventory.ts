'use client';

import * as React from "react";
import { getEmployees } from "services/employees.service.mock";
import type { Employees, EmployeesFilters } from "types/employees";
import type { ServerQuery } from "types/server-query";
import { toUndefTrim } from "@/lib/filters";

export function useEmployeesInventory(
  serverQuery: ServerQuery,
  filters: EmployeesFilters = {}
) {
  const [rows, setRows] = React.useState<Employees[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  /**
   * ประกอบ query สำหรับ service (object เสถียร)
   * - pageIndex (0-based) -> page (1-based)
   * - แปลง filters undefined/"" ให้เป็นค่าที่ service รองรับ
   *   เช่น statusFilter, departmentFilter, searchText
   */
  const serviceQuery = React.useMemo(() => {
    const { pageIndex = 0, pageSize = 10, sortBy, sortOrder } = serverQuery;

    // normalize filters: ถ้า UI ส่งค่าว่างมา ให้แปลงเป็น undefined ก่อน แล้ว map เป็น "" เฉพาะ key ที่ service ต้องการ
    const status = toUndefTrim(filters.status);
    const department = toUndefTrim(filters.department);
    const search = filters.search ?? "";

    return {
      page: pageIndex + 1,               // service ของคุณใช้ 1-based
      limit: pageSize,                   // ถ้า service ใช้ pageSize ให้แก้เป็น pageSize
      sortBy,
      sortOrder,
      searchText: search,
      statusFilter: status ?? "",        // ตาม signature ปัจจุบันของ getEmployees
      departmentFilter: department ?? "",
    };
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

        const res = await getEmployees(serviceQuery, ac.signal);

        if (!alive) return;

        // รองรับได้หลายโครง response (กันไว้):
        // - { data, pagination: { total } }
        // - { items, total }
        // - { items, totalCount }
        const items =
          (res as any).data ??
          (res as any).items ??
          [];

        const total =
          (res as any).pagination?.total ??
          (res as any).totalCount ??
          (res as any).total ??
          0;

        setRows(Array.isArray(items) ? items : []);
        setTotalRows(Number.isFinite(total) ? total : 0);
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

// src/hooks/useEmployeesInventory.ts
"use client";

import * as React from "react";
import { getEmployees } from "services/employees.service.mock";

import type { Employees } from "types/employees";

type Query = {
  pageIndex: number; // 0-based (เหมือน useDeviceInventory)
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type Filters = {
  status: string;       // EmployeeStatus หรือ "" (normalized แล้ว)
  department: string;   // department หรือ ""
  search: string;       // คำค้นหา
};

export function useEmployeesInventory(query: Query, filters?: Filters) {
  const [rows, setRows] = React.useState<Employees[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const ac = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res = await getEmployees(
          {
            page: query.pageIndex + 1,       // ✅ map pageIndex -> page (1-based)
            limit: query.pageSize,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            searchText: filters?.search || "",
            statusFilter: filters?.status || "",           // ✅ ใช้ชื่อคีย์แบบ service
            departmentFilter: filters?.department || "",
          },
          ac.signal
        );

        setRows(res.data ?? []);
        setTotalRows(res.pagination?.total ?? 0);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(true);
        setErrorMessage(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => ac.abort();
  }, [
    query.pageIndex,
    query.pageSize,
    query.sortBy,
    query.sortOrder,
    filters?.search,
    filters?.status,
    filters?.department,
  ]);

  return { rows, totalRows, isLoading, isError, errorMessage };
}

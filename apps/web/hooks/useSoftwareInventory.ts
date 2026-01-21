
// src/hooks/useSoftwareInventory.ts
"use client";
import * as React from "react";
import { getItemsStock } from "services/software.service.mock";

import type { SoftwareItem } from "types/software";

export function useSoftwareInventory(
  query: { pageIndex: number; pageSize: number; sortBy?: string; sortOrder?: "asc" | "desc" },
  filters?: { status?: string; type?: string; manufacturer?: string; search?: string }
) {
  const [rows, setRows] = React.useState<SoftwareItem[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  // ถ้ายังไม่มี options จาก BE ก็ mock แบบเดิมไปก่อน
  const statusOptions = React.useMemo(() => ["Active", "Expired", "Expiring"], []);
  const typeOptions = React.useMemo(() => ["Standard", "Special", "Exception"], []);
  const manufacturerOptions = React.useMemo(() => ["Microsoft", "Adobe", "Autodesk", "JetBrains"], []);

  React.useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res = await getItemsStock({
          page: query.pageIndex + 1,   // server ใช้ 1-based
          limit: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          statusFilter: filters?.status ?? "",
          typeFilter: filters?.type ?? "",
          manufacturerFilter: filters?.manufacturer ?? "",
          searchText: filters?.search ?? "",
        });

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
    query.pageIndex, query.pageSize, query.sortBy, query.sortOrder,
    filters?.status, filters?.type, filters?.manufacturer, filters?.search
  ]);

  return { rows, totalRows, isLoading, isError, errorMessage, statusOptions, typeOptions, manufacturerOptions };
}

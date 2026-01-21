
// src/hooks/useDeviceInventory.ts
"use client";
import * as React from "react";
import { getDevices } from "services/devices.service.mock";
import type { DeviceItem } from "types/device"; // หรือ "types" ตามโปรเจกต์คุณ

type Query = { pageIndex: number; pageSize: number; sortBy?: string; sortOrder?: "asc" | "desc" };
type Filters = { deviceGroup: string; deviceType: string; os: string; search: string };

export function useDeviceInventory(query: Query, filters?: Filters) {
  const [rows, setRows] = React.useState<DeviceItem[]>([]);
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

        const res = await getDevices(
          {
            page: query.pageIndex + 1,         // ✅ map pageIndex -> page
            limit: query.pageSize,              // ✅ map pageSize -> limit
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            searchText: filters?.search || "",  // ✅ ใช้คีย์ใหม่ที่ service รับ
            deviceTypeFilter: filters?.deviceType || "",
            osFilter: filters?.os || "",
          },
          ac.signal
        );

        setRows(res.data ?? []);                                  // ✅ ใช้ data
        setTotalRows(res.pagination?.total ?? 0);                 // ✅ ใช้ pagination.total
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
    filters?.deviceGroup,
    filters?.deviceType,
    filters?.os,
  ]);

  return { rows, totalRows, isLoading, isError, errorMessage };
}

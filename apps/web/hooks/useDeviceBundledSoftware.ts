
// hooks/useDeviceBundledSoftware.ts
"use client";

import * as React from "react";
import {
  fetchDeviceSoftware,
  DeviceSoftwareRow,
  DeviceSoftwareQuery,
} from "services/device-software.service";

export function useDeviceBundledSoftware(
  deviceId: string | number,
  q: {
    pageIndex: number;
    pageSize: number;
    sortBy?: "softwareName" | "manufacturer" | "version" | "category" | "lastScan";
    sortOrder?: "asc" | "desc";
    search?: string;
    manufacturer?: string;
    category?: string;
    compliance?: string;
  }
) {
  const [rows, setRows] = React.useState<DeviceSoftwareRow[]>([]);
  const [totalRows, setTotal] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const query: DeviceSoftwareQuery = {
          page: q.pageIndex + 1,
          pageSize: q.pageSize,
          sortBy: q.sortBy,
          sortOrder: q.sortOrder,
          search: q.search,
          manufacturer: q.manufacturer,
          category: q.category,
          compliance: q.compliance,
        };

        const res = await fetchDeviceSoftware(deviceId, query);

        if (!ac.signal.aborted) {
          setRows((res.items ?? []) as DeviceSoftwareRow[]);   // ✅ คืน DeviceSoftwareRow[] เสมอ
          setTotal(res.total ?? (res.items?.length ?? 0));
        }
      } catch (e: any) {
        if (!ac.signal.aborted) {
          setError(true);
          setErrorMessage(e?.message ?? "Load failed");
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [
    deviceId,
    q.pageIndex,
    q.pageSize,
    q.sortBy,
    q.sortOrder,
    q.search,
    q.manufacturer,
    q.category,
    q.compliance,
  ]);

  return { rows, totalRows, isLoading, isError, errorMessage };
}


// src/hooks/useLicenseInventory.ts
"use client";
import * as React from "react";
import { getLicenses } from "services/licenses.service.mock";

import type { LicenseItem } from "types/license";
import type { LicenseFilters } from "types/license";

export function useLicenseInventory(
  query: {
    pageIndex: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
  //   รับแบบ optional ตาม type กลาง
  filters?: Pick<LicenseFilters, "status" | "licenseModel" | "manufacturer" | "search">
) {
  const [rows, setRows] = React.useState<LicenseItem[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  // (optional) ให้ options เป็น tuple literal จะ strict ขึ้น
  const statusOptions = React.useMemo(() => ["Active", "Expired", "Expiring"] as const, []);
  const licenseModelOptions = React.useMemo(() => ["Per-User", "Per-Device", "Subscription", "Perpetual"] as const, []);
  const manufacturerOptions = React.useMemo(() => ["Microsoft", "Adobe", "Autodesk"] as const, []);

  React.useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res = await getLicenses({
          //   service ใช้ 1-based
          page: query.pageIndex + 1,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          //   ส่ง optional ตรง ๆ — ไม่ต้อง || ""
          status: filters?.status,
          licenseModel: filters?.licenseModel,
          manufacturer: filters?.manufacturer,
          search: filters?.search,
        });

        setRows(res.items ?? []);
        setTotalRows(res.totalCount ?? 0);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(true);
        setErrorMessage(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [
    query.pageIndex, query.pageSize, query.sortBy, query.sortOrder,
    filters?.status, filters?.licenseModel, filters?.manufacturer, filters?.search
  ]);

  return {
    rows,
    totalRows,
    isLoading,
    isError,
    errorMessage,
    statusOptions: [...statusOptions],
    licenseModelOptions: [...licenseModelOptions],
    manufacturerOptions: [...manufacturerOptions],
  };
}
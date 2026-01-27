import * as React from "react";
import { getLicenses } from "services/licenses.service.mock";

import type { LicenseItem } from "types/license";

export function useLicenseInventory(
  query: { pageIndex: number; pageSize: number; sortBy?: string; sortOrder?: "asc" | "desc" },
  filters?: { status: string; licenseModel: string; manufacturer: string; search: string }
) {
  const [rows, setRows] = React.useState<LicenseItem[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  const statusOptions = React.useMemo(() => ["Active", "Expired", "Expiring"], []);
  const licenseModelOptions = React.useMemo(() => ["Per-User", "Per-Device", "Subscription"], []);
  const manufacturerOptions = React.useMemo(() => ["Microsoft", "Adobe", "Autodesk"], []);

  React.useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res = await getLicenses({
          page: query.pageIndex + 1,
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          status: filters?.status || "",
          licenseModel: filters?.licenseModel || "",
          manufacturer: filters?.manufacturer || "",
          search: filters?.search || "",
        });

        setRows(res.items ?? []);
        setTotalRows(res.total ?? 0);
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
    filters?.status, filters?.licenseModel, filters?.manufacturer, filters?.search
  ]);

  return { rows, totalRows, isLoading, isError, errorMessage, statusOptions, licenseModelOptions, manufacturerOptions };
}

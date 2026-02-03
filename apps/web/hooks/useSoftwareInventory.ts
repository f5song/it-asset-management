import { getItemsStock } from "@/services/software.service.mock";
import { SoftwareItem, SoftwareStatus, SoftwareType } from "@/types";
import React from "react";

export function useSoftwareInventory(
  query: { pageIndex: number; pageSize: number; sortBy?: string; sortOrder?: "asc" | "desc" },
  filters?: { status?: SoftwareStatus; type?: SoftwareType; manufacturer?: string; search?: string }
) {
  const [rows, setRows] = React.useState<SoftwareItem[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  const statusOptions = ["Active", "Expired", "Expiring"];
  const typeOptions = ["Standard", "Special", "Exception"];
  const manufacturerOptions = ["Microsoft", "Adobe", "Autodesk", "JetBrains"];

  React.useEffect(() => {
    const ac = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res = await getItemsStock({
          page: query.pageIndex + 1, // UI = 0-based → server = 1-based
          pageSize: query.pageSize,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          status: filters?.status,
          type: filters?.type,
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
    }

    run();
    return () => ac.abort();
  }, [
    query.pageIndex, query.pageSize, query.sortBy, query.sortOrder,
    filters?.status, filters?.type, filters?.manufacturer, filters?.search
  ]);

  return {
    rows,
    totalRows,
    isLoading,
    isError,
    errorMessage,
    statusOptions,
    typeOptions,
    manufacturerOptions,
  };
}
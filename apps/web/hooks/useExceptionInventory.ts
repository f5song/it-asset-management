// hooks/useExceptionInventory.ts
"use client";

import * as React from "react";
import { getExceptionDefinitions } from "services/exceptions.service.mock";
import type {
  ExceptionDefinition,
  PolicyStatus,
  ExceptionCategory,
  ExceptionDomainFilters
} from "types/exception";
import type { ServerQuery } from "types/server-query";
import { toUndefTrim } from "lib/filters";

export function useExceptionInventory(
  serverQuery: ServerQuery,
  filters: ExceptionDomainFilters = {}
) {
  const [rows, setRows] = React.useState<ExceptionDefinition[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  const serviceQuery = React.useMemo(() => {
    const { pageIndex = 0, pageSize = 10, sortBy, sortOrder } = serverQuery;

    const searchText = filters.searchText ?? "";
    const status = toUndefTrim(filters.status) as PolicyStatus | undefined;
    const category = toUndefTrim(filters.category) as ExceptionCategory | undefined;
    const owner = toUndefTrim(filters.owner);

    return {
      page: pageIndex + 1,   // service mock: 1-based
      limit: pageSize,
      sortBy,
      sortOrder,
      searchText,
      statusFilter: status ?? "",
      categoryFilter: category ?? "",
      ownerFilter: owner ?? "",
    };
  }, [
    serverQuery.pageIndex,
    serverQuery.pageSize,
    serverQuery.sortBy,
    serverQuery.sortOrder,
    filters.searchText,
    filters.status,
    filters.category,
    filters.owner,
  ]);

  React.useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res = await getExceptionDefinitions(serviceQuery as any, ac.signal);
        if (!alive) return;

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
        setErrorMessage(e?.message ?? "โหลดรายการข้อยกเว้นไม่สำเร็จ");
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
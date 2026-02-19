// hooks/useExceptionInventory.ts
"use client";

import * as React from "react";
import { getExceptionDefinitions } from "@/services/exceptions.service";
import type {
  ExceptionDefinitionRow,
  PolicyStatus,
  ExceptionDomainFilters,
  ExceptionDefinitionListQuery,
  ExceptionDefinitionListResponse,
} from "types/exception";
import type { ServerQuery } from "types/server-query";
import { toUndefTrim } from "lib/filters";

export function useExceptionInventory(
  serverQuery: ServerQuery,
  filters: ExceptionDomainFilters = {},
) {
  const [rows, setRows] = React.useState<ReadonlyArray<ExceptionDefinitionRow>>(
    [],
  );
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  const serviceQuery = React.useMemo<ExceptionDefinitionListQuery>(() => {
    const { pageIndex = 0, pageSize = 10, sortBy, sortOrder } = serverQuery;

    const search = toUndefTrim(filters.search) ?? undefined;
    const status = toUndefTrim(filters.status) as PolicyStatus | undefined;

    return {
      page: pageIndex + 1, // backend 1-based
      pageSize,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      search,
      status, // undefined = All
    };
  }, [
    serverQuery.pageIndex,
    serverQuery.pageSize,
    serverQuery.sortBy,
    serverQuery.sortOrder,
    filters.search,
    filters.status,
  ]);

  React.useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res: ExceptionDefinitionListResponse = await getExceptionDefinitions(
          serviceQuery,
          ac.signal,
        );
        if (!alive) return;

        setRows(res.items ?? []); // ✅ ตอนนี้เป็น ExceptionDefinitionRow[] แล้ว
        setTotalRows(
          Number.isFinite(res.totalCount)
            ? res.totalCount
            : (res.items?.length ?? 0),
        );
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        if (!alive) return;
        setError(true);
        setErrorMessage(e?.message ?? "โหลดรายการข้อยกเว้นไม่สำเร็จ");
        setRows([]);
        setTotalRows(0);
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
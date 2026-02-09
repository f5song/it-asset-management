// hooks/useExceptionInventory.ts
"use client";

import * as React from "react";
import { getExceptionDefinitions } from "@/services/exceptions.service.mock";
import type {
  ExceptionDefinition,
  PolicyStatus,
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

    const search = toUndefTrim(filters.search) ?? "";
    const status = toUndefTrim(filters.status) as PolicyStatus | undefined;
    // const owner = toUndefTrim(filters.owner); // ถ้า service ไม่มี owner ก็อย่าส่ง

    return {
      page: pageIndex + 1,         // ✅ 1-based
      pageSize,                    // ✅ ใช้ key ที่ service รองรับ
      sortBy,                      // ✅ ส่งต่อไปตรง ๆ
      sortOrder,                   // ✅
      search,                      // ✅
      status,                      // ✅ undefined = All Status
      // owner,                    // (เพิ่มภายหลังถ้า service รองรับ)
    };
  }, [
    serverQuery.pageIndex,
    serverQuery.pageSize,
    serverQuery.sortBy,
    serverQuery.sortOrder,
    filters.search,
    filters.status,
    // filters.owner,
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
          (res as any).items ??
          (res as any).data ??
          [];
        const total =
          (res as any).totalCount ??
          (res as any).pagination?.total ??
          (res as any).total ??
          0;

        setRows(Array.isArray(items) ? items : []);
        setTotalRows(Number.isFinite(total) ? Number(total) : 0);
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
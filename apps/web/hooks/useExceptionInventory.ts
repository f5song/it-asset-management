'use client';

import * as React from "react";
import type {
  ExceptionItem,
  ExceptionGroup,
  ExceptionCategory,
  ExceptionScope,
  ExceptionDomainFilters,
} from "types/exception";
import type { ServerQuery } from "types/server-query";
import { toUndefTrim } from "@/lib/filters";
import { getExceptions } from "@/services/exceptions.service.mock";

/**
 * Hook ดึงรายการ Exceptions (มาตรฐานเดียวกับ useEmployeesInventory / useDeviceInventory)
 * - รับ domain filters โดยตรง (undefined = ไม่กรอง, string ว่าง = UI สะดวก)
 * - แปลงเป็น service params ที่ mock รองรับ: searchText, groupFilter, categoryFilter, scopeFilter, ownerFilter, targetFilter
 */
export function useExceptionInventory(
  serverQuery: ServerQuery,
  filters: ExceptionDomainFilters = {}
) {
  const [rows, setRows] = React.useState<ExceptionItem[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  // ประกอบ query ให้ service mock (object เสถียร)
  const serviceQuery = React.useMemo(() => {
    const { pageIndex = 0, pageSize = 10, sortBy, sortOrder } = serverQuery;

    // normalize domain filters
    const searchText = filters.searchText ?? ""; // keyword/search
    const group = toUndefTrim(filters.group) as ExceptionGroup | undefined;
    const category = toUndefTrim(filters.category) as ExceptionCategory | undefined;
    const scope = toUndefTrim(filters.scope) as ExceptionScope | undefined;
    const owner = toUndefTrim(filters.owner);
    const target = toUndefTrim(filters.target);

    return {
      page: pageIndex + 1,  // service mock ใช้ 1-based
      limit: pageSize,
      sortBy,
      sortOrder,
      searchText: searchText,
      groupFilter: group ?? "",
      categoryFilter: category ?? "",
      scopeFilter: scope ?? "",
      ownerFilter: owner ?? "",
      targetFilter: target ?? "",
    };
  }, [
    serverQuery.pageIndex,
    serverQuery.pageSize,
    serverQuery.sortBy,
    serverQuery.sortOrder,
    filters.searchText,
    filters.group,
    filters.category,
    filters.scope,
    filters.owner,
    filters.target,
  ]);

  React.useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res = await getExceptions(serviceQuery, ac.signal);
        if (!alive) return;

        // รองรับได้หลายโครง response
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
        setErrorMessage(e?.message ?? "โหลดข้อมูลข้อยกเว้น (exceptions) ไม่สำเร็จ");
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

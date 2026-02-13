"use client";

import * as React from "react";
import type {
  ExceptionDefinition,
  ExceptionDomainFilters,
  ExceptionDefinitionListQuery,
  ExceptionDefinitionListResponse,
} from "@/types/exception";
import type { ServerQuery } from "@/types/server-query";
import { toUndefTrim } from "@/lib/filters";
import { listExceptionDefinitions } from "@/services/exceptions.service";


type Result = {
  rows: ExceptionDefinition[];
  totalRows: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
};

/**
 * useExceptionDefinitionsInventory
 * - ใช้ดึง "รายการ Exception Definition (Catalog)" แบบแบ่งหน้า/เรียงลำดับ
 * - รองรับฟิลเตอร์: status, search
 * - คอมโพส query จาก serverQuery (pageIndex/pageSize/sortBy/sortOrder) + domainFilters
 */
export function useExceptionDefinitionsInventory(
  serverQuery: ServerQuery,
  filters: ExceptionDomainFilters = {},
): Result {
  const [rows, setRows] = React.useState<ExceptionDefinition[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  /**
   * ประกอบ query สำหรับ service
   * - pageIndex (0-based) -> page (1-based)
   * - pageSize as is
   * - status: คงเป็น union ไม่ trim
   * - search: trim แล้ว fallback เป็น ""
   * - sortBy/sortOrder: แนบถ้ามี (ขึ้นกับ service mock)
   */
  const serviceQuery = React.useMemo(() => {
    const { pageIndex = 0, pageSize = 10, sortBy, sortOrder } = serverQuery;

    const status = filters.status; // PolicyStatus | undefined
    const search = toUndefTrim(filters.search) ?? "";

    const q: ExceptionDefinitionListQuery & {
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {
      page: pageIndex + 1,
      pageSize,
      search,
      status,
      ...(sortBy ? { sortBy: String(sortBy) } : {}),
      ...(sortOrder ? { sortOrder } : {}),
    };

    return q;
  }, [
    serverQuery.pageIndex,
    serverQuery.pageSize,
    serverQuery.sortBy,
    serverQuery.sortOrder,
    filters.status,
    filters.search,
  ]);

  React.useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        const res: ExceptionDefinitionListResponse = await listExceptionDefinitions(
          serviceQuery as any,
          ac.signal,
        );

        if (!alive) return;

        const items = (res as any).items ?? [];
        const total =
          (res as any).totalCount ??
          (res as any).pagination?.total ??
          (res as any).total ??
          0;

        setRows(Array.isArray(items) ? (items as ExceptionDefinition[]) : []);
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

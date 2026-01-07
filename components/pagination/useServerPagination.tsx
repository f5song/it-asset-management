
// src/pagination/useServerPagination.tsx
'use client';

import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ListService } from './listService';


export type SortOrder = 'asc' | 'desc' | undefined;

export type OffsetPaginationParams = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  [key: string]: string | number | boolean | undefined;
};

export type OffsetPageResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalPages?: number;
};

export type UseServerPaginationOptions<T> = {
  service: ListService;
  endpoint: string;
  initialPage?: number;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: SortOrder;
  initialQuery?: Record<string, string | number | boolean | undefined>;
  transform?: (item: any) => T;
};

export function useServerPagination<T = any>({
  service,
  endpoint,
  initialPage = 1,
  initialPageSize = 20,
  initialSortBy,
  initialSortOrder,
  initialQuery = {},
  transform,
}: UseServerPaginationOptions<T>) {
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  const [items, setItems] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

  const [query, setQuery] = useState<Record<string, any>>(initialQuery);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = async (nextPage = page) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const params: OffsetPaginationParams = {
      page: nextPage,
      pageSize,
      sortBy,
      sortOrder,
      ...query,
    };

    try {
      const res: OffsetPageResponse<any> = await service.listByOffset<any>(
        endpoint,
        params,
        abortRef.current.signal
      );
      const processed = transform ? res.items.map(transform) : res.items;
      setItems(processed);
      setTotalCount(res.totalCount);
      setHasNext(!!res.hasNext);
      setHasPrev(!!res.hasPrev);
    } catch (e: any) {
      setError(e?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const goTo = (p: number) => setPage(Math.max(1, p));
  const changePageSize = (ps: number) => {
    setPageSize(ps);
    setPage(1);
  };
  const changeSort = (nextSortBy?: string, nextSortOrder?: SortOrder) => {
    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    setPage(1);
  };
  const changeQuery = (next: Record<string, any>) => {
    setQuery((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortBy, sortOrder, JSON.stringify(query)]);

  const rangeLabel = useMemo(() => {
    if (totalCount === 0) return '0 of 0';
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalCount);
    return `${start}-${end} of ${totalCount}`;
  }, [page, pageSize, totalCount]);

  const totalPages = useMemo(
    () => (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0),
    [totalCount, pageSize]
  );

  return {
    items,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
    rangeLabel,
    page,
    pageSize,
    sortBy,
    sortOrder,
    loading,
    error,
    actions: {
      goTo,
      changePageSize,
      changeSort,
      changeQuery,
      refresh: () => fetchPage(page),
    },
  };
}


// src/components/pagination/Pagination.tsx
'use client';

import React, { useMemo } from 'react';

type BaseProps = {
  totalCount: number;
  pageSize: number;
  currentPage: number;                // 1-based
  onPageChange: (page: number) => void;
  siblingCount?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
};

type AdapterProps = {
  pagination?: { pageIndex: number; pageSize: number };           // 0-based
  totalPages?: number;
  onPaginationChange?: (next: { pageIndex: number; pageSize: number }) => void;
};

type Props = BaseProps & AdapterProps;

export function Pagination({
  // Base
  totalCount: _totalCount,
  pageSize: _pageSize,
  currentPage: _currentPage,
  onPageChange: _onPageChange,
  siblingCount = 1,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,
  // Adapter
  pagination,
  totalPages,
  onPaginationChange,
}: Partial<BaseProps> & AdapterProps) {
  // ----- Adapter layer -----
  const pageSize = pagination ? pagination.pageSize : (_pageSize ?? 10);
  const currentPage = pagination ? pagination.pageIndex + 1 : (_currentPage ?? 1);

  const totalCount = useMemo(() => {
    if (typeof totalPages === 'number' && totalPages > 0) {
      return totalPages * pageSize;
    }
    return _totalCount ?? 0;
  }, [totalPages, pageSize, _totalCount]);

  const onPageChange = (next1Based: number) => {
    if (disabled) return;
    if (onPaginationChange && pagination) {
      onPaginationChange({ pageIndex: Math.max(0, next1Based - 1), pageSize });
    } else {
      _onPageChange?.(next1Based);
    }
  };

  const onPageSizeChangeAdapter = (nextSize: number) => {
    if (disabled) return;
    if (onPaginationChange && pagination) {
      onPaginationChange({ pageIndex: 0, pageSize: nextSize });
    } else {
      onPageSizeChange?.(nextSize);
    }
  };

  // ----- compute pages -----
  const totalPagesComputed = useMemo(
    () => (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0),
    [totalCount, pageSize]
  );

  const pageRange = useMemo(() => {
    if (totalPagesComputed <= 1) return [1];
    const start = Math.max(1, currentPage - (siblingCount ?? 1));
    const end = Math.min(totalPagesComputed, currentPage + (siblingCount ?? 1));
    const range: (number | '...')[] = [1];
    if (start > 2) range.push('...');
    for (let p = start; p <= end; p++) {
      if (p !== 1 && p !== totalPagesComputed) range.push(p);
    }
    if (end < totalPagesComputed - 1) range.push('...');
    range.push(totalPagesComputed);
    return range;
  }, [currentPage, siblingCount, totalPagesComputed]);

  if (totalPagesComputed === 0) return null;

  return (
    <div
      className={`flex items-center gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Page size */}
      {onPageSizeChange && (
        <label className="mr-2 flex items-center gap-1 text-sm text-gray-700">
          <span>Per page:</span>
          <select
            className="rounded border-gray-300 bg-white px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChangeAdapter(Number(e.target.value))}
          >
            {(pageSizeOptions ?? [10, 20, 50, 100]).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Prev */}
      <button
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        Previous
      </button>

      {/* Numbers */}
      <nav className="flex items-center gap-1">
        {pageRange.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-500">…</span>
          ) : (
            <button
              key={`p-${p}`}
              onClick={() => onPageChange(p)}
              className={[
                'rounded px-3 py-1 text-sm',
                p === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
              ].join(' ')}
            >
              {p}
            </button>
          )
        )}
      </nav>

      {/* Next */}
      <button
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
        onClick={() => onPageChange(Math.min(totalPagesComputed, currentPage + 1))}
        disabled={currentPage >= totalPagesComputed}
      >
        Next
      </button>
    </div>
  );
}

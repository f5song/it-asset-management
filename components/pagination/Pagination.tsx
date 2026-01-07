
// src/components/pagination/Pagination.tsx
'use client';

import React, { useMemo } from 'react';

type Props = {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // จำนวนหน้าข้าง ๆ ปัจจุบัน
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

export function Pagination({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  siblingCount = 1,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: Props) {
  const totalPages = useMemo(
    () => (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0),
    [totalCount, pageSize]
  );

  const pageRange = useMemo(() => {
    if (totalPages <= 1) return [1];
    const range: (number | '...')[] = [];
    const start = Math.max(1, currentPage - siblingCount);
    const end = Math.min(totalPages, currentPage + siblingCount);

    range.push(1);
    if (start > 2) range.push('...');
    for (let p = start; p <= end; p++) {
      if (p !== 1 && p !== totalPages) range.push(p);
    }
    if (end < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);

    return range;
  }, [currentPage, siblingCount, totalPages]);

  if (totalPages === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Page size */}
      {onPageSizeChange && (
        <label className="mr-2 flex items-center gap-1 text-sm text-gray-700">
          <span>ต่อหน้า:</span>
          <select
            className="rounded border-gray-300 bg-white px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((opt) => (
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
        ก่อนหน้า
      </button>

      {/* Numbers */}
      <nav className="flex items-center gap-1">
        {pageRange.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-500">
              ...
            </span>
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
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        ถัดไป
      </button>
    </div>
  );
}

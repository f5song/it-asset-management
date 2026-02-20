// src/components/pagination/Pagination.tsx
'use client';

import React, { useMemo } from 'react';

type BaseProps = {
  /** ใช้โหมด base (1-based) เมื่อไม่ได้ใช้ adapter 0-based */
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
  /** โหมด adapter (0-based) สำหรับ TanStack/Controller */
  pagination?: { pageIndex: number; pageSize: number };           // 0-based
  totalPages?: number; // ถ้ามี ใช้เป็นแหล่งจริงของจำนวนหน้า
  onPaginationChange?: (next: { pageIndex: number; pageSize: number }) => void;
};

type Props = Partial<BaseProps> & AdapterProps;

export function Pagination({
  // Base mode props (optional ถ้าใช้ adapter)
  totalCount: _totalCount,
  pageSize: _pageSize,
  currentPage: _currentPage,
  onPageChange: _onPageChange,
  siblingCount = 1,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,

  // Adapter mode props (แนะนำให้ใช้คู่กับ DataTable)
  pagination,
  totalPages,
  onPaginationChange,
}: Props) {
  // ----- Adapter layer (0-based -> 1-based) -----
  const isAdapter = Boolean(onPaginationChange && pagination);

  // ขนาดหน้า: จาก adapter (ถ้ามี) มิฉะนั้น base
  const pageSize = isAdapter
    ? (pagination!.pageSize ?? 10)
    : (_pageSize ?? 10);

  // หน้า (1-based) เพื่อแสดงผล
  const currentPage = isAdapter
    ? (pagination!.pageIndex ?? 0) + 1
    : (_currentPage ?? 1);

  // totalCount/totalPages ที่ใช้คำนวณ
  const totalCount = useMemo(() => {
    if (typeof totalPages === 'number' && totalPages > 0) {
      // ถ้า server คำนวณหน้ามาให้แล้ว ใช้เป็นแหล่งจริง
      return totalPages * pageSize;
    }
    return _totalCount ?? 0;
  }, [totalPages, pageSize, _totalCount]);

  // จำนวนหน้าที่คำนวณได้
  const totalPagesComputed = useMemo(
    () => (totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0),
    [totalCount, pageSize]
  );

  // ----- handlers -----
  const gotoPage1 = (next1: number) => {
    if (disabled) return;
    if (totalPagesComputed === 0) return;

    const safe = Math.max(1, Math.min(totalPagesComputed, next1));

    if (isAdapter) {
      onPaginationChange!({ pageIndex: safe - 1, pageSize });
    } else {
      _onPageChange?.(safe);
    }
  };

  const onPrev = () => gotoPage1(currentPage - 1);
  const onNext = () => gotoPage1(currentPage + 1);

  const onPageSizeChangeAdapter = (nextSize: number) => {
    if (disabled) return;
    if (isAdapter) {
      // ดีฟอลต์: รีเซ็ตหน้าเป็น 1 เมื่อเปลี่ยน page size
      onPaginationChange!({ pageIndex: 0, pageSize: nextSize });
    } else {
      onPageSizeChange?.(nextSize);
    }
  };

  // ----- สร้างหน้าต่างเลขหน้า -----
  const pageRange = useMemo(() => {
    if (totalPagesComputed <= 1) return [1];
    const sib = Math.max(0, siblingCount ?? 1);

    const first = 1;
    const last = totalPagesComputed;

    const start = Math.max(first + 1, currentPage - sib);
    const end = Math.min(last - 1, currentPage + sib);

    const range: (number | '...')[] = [first];
    if (start > first + 1) range.push('...');

    for (let p = start; p <= end; p++) {
      if (p !== first && p !== last) range.push(p);
    }

    if (end < last - 1) range.push('...');
    if (last > first) range.push(last);

    return range;
  }, [currentPage, siblingCount, totalPagesComputed]);

  if (totalPagesComputed === 0) return null;

  // ----- render -----
  return (
    <div
      className={`flex items-center gap-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Page size */}
      {pageSizeOptions?.length ? (
        <label className="mr-2 flex items-center gap-1 text-sm text-gray-700">
          <span>Per page:</span>
          <select
            className="rounded border-gray-300 bg-white px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChangeAdapter(Number(e.target.value))}
            disabled={disabled}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {/* Prev */}
      <button
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
        onClick={onPrev}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        Previous
      </button>

      {/* Numbers */}
      <nav className="flex items-center gap-1" aria-label="Page numbers">
        {pageRange.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-500" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={`p-${p}`}
              onClick={() => gotoPage1(p)}
              className={[
                'rounded px-3 py-1 text-sm',
                p === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
              ].join(' ')}
              aria-current={p === currentPage ? 'page' : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          )
        )}
      </nav>

      {/* Next */}
      <button
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
        onClick={onNext}
        disabled={currentPage >= totalPagesComputed}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}
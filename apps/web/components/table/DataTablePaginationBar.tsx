
// src/components/datatable/DataTablePaginationBar.tsx
'use client';

import React from 'react';
import { PaginationState } from '../../types';
import { Pagination } from '../pagination/Pagination';

export function DataTablePaginationBar({
  pagination,
  totalPages,
  onPaginationChange,
  disabled,
}: {
  pagination: PaginationState;
  totalPages?: number;
  onPaginationChange: (next: PaginationState) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end border-t border-slate-200 bg-white px-2 py-2">
      <Pagination
        // --- Adapter props ของ Pagination เดิมของคุณ ---
        pagination={pagination} // { pageIndex: 0-based, pageSize }
        totalPages={totalPages} // ถ้ามี (server-side)
        onPaginationChange={onPaginationChange} // ({ pageIndex, pageSize }) 0-based
        // --- Options ---
        siblingCount={2}
        onPageSizeChange={() => {
          /* ให้ Pagination ภายในจัดการเรียก onPaginationChange({ pageIndex: 0, pageSize }) */
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        disabled={disabled}
      />
    </div>
  );
}

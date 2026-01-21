
'use client';

import React from 'react';
import type { SortingState } from '@tanstack/react-table';
// ใช้ AppColumnDef จากที่คุณประกาศกลาง (ถ้าคุณย้ายไปที่ 'types/table' ก็เปลี่ยน path ตรงนี้)
import type { AppColumnDef } from '../../types';
import { cn } from '../ui';

type Props<T extends { id?: string | number }> = {
  columns: AppColumnDef<T>[];            // คอลัมน์ของตาราง
  sorting?: SortingState;             // TanStack: [{ id: string; desc: boolean }]
  onToggleSort?: (col: AppColumnDef<T>) => void;
  size: 'xs' | 'sm' | 'md';
  defaultColMinWidth: number;
};

export function DataTableHeader<T extends { id?: string | number }>({
  columns,
  sorting,
  onToggleSort,
  size,
  defaultColMinWidth,
}: Props<T>) {
  const sizeClass = {
    xs: 'px-2 py-1 text-[12px]',
    sm: 'px-3 py-2 text-[13px]',
    md: 'px-3 py-2 text-[14px]',
  }[size];

  const alignToClass = (align?: 'left' | 'center' | 'right') =>
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  // ใช้ตัวแรกเป็นคอลัมน์ sorting หลัก (ขยายเป็น multi-column ภายหลังได้)
  const current = sorting?.[0];
  const activeId = current?.id ?? null;
  const isDesc = current?.desc ?? false;

  return (
    <thead className="sticky top-0 z-10 bg-slate-50">
      <tr>
        {columns.map((col) => {
          const colId = String(col.accessorKey);
          const active = activeId === colId;
          const indicator = active ? (isDesc ? ' 🔽' : ' 🔼') : '';

          return (
            <th
              key={String(col.id)}
              className={cn(
                'font-semibold text-slate-700',
                sizeClass,
                alignToClass(col.align as any),
                (col as any).headerClassName, // ถ้า AppColumnDef ของคุณมี field นี้
              )}
              style={{ minWidth: col.width ?? defaultColMinWidth, whiteSpace: 'nowrap' }}
              aria-sort={active ? (isDesc ? 'descending' : 'ascending') : 'none'}
              scope="col"
            >
              <button
                type="button"
                onClick={() => onToggleSort?.(col)}
                className="bg-transparent font-semibold"
                style={{ border: 'none', cursor: 'pointer' }}
                aria-pressed={active}
                aria-label={
                  active
                    ? `Sort by ${colId} ${isDesc ? 'descending' : 'ascending'}`
                    : `Sort by ${colId}`
                }
              >
                {col.header}
                {indicator}
              </button>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

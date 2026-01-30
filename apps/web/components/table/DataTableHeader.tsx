
'use client';

import React from 'react';
// ปรับ path ให้ตรงกับโปรเจกต์ของคุณ ถ้าคุณย้าย type ไปไว้ที่ 'types/table'

import { cn } from '../ui';
import { AppColumnDef, SortingState } from '@/types';

type Props<T extends { id?: string | number }> = {
  /** คอลัมน์ของตาราง */
  columns: AppColumnDef<T>[];

  /** TanStack: [{ id: string; desc: boolean }] */
  sorting?: SortingState;

  /** คลิกหัวคอลัมน์เพื่อ toggle sort */
  onToggleSort?: (col: AppColumnDef<T>) => void;

  size: 'xs' | 'sm' | 'md';
  defaultColMinWidth: number;

  /** ✅ เฮดเดอร์ช่องนำหน้า (เช่น checkbox select-all ของหน้า) */
  leadingHeaderCell?: React.ReactNode;
};

export function DataTableHeader<T extends { id?: string | number }>({
  columns,
  sorting,
  onToggleSort,
  size,
  defaultColMinWidth,
  leadingHeaderCell,
}: Props<T>) {
  const sizeClass = {
    xs: 'px-2 py-1 text-[12px]',
    sm: 'px-3 py-2 text-[13px]',
    md: 'px-3 py-2 text-[14px]',
  }[size];

  const alignToClass = (align?: 'left' | 'center' | 'right') =>
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  // ใช้ตัวแรกเป็นคอลัมน์ sorting หลัก
  const current = sorting?.[0];
  const activeId = current?.id ?? null;
  const isDesc = current?.desc ?? false;

  return (
    <thead className="sticky top-0 z-10 bg-slate-50">
      <tr>
        {/* ✅ ช่องนำหน้า เช่น checkbox select page */}
        {leadingHeaderCell}

        {columns.map((col) => {
          const colId = String(col.accessorKey);
          const isActive = activeId === colId;
          const indicator = isActive ? (isDesc ? ' 🔽' : ' 🔼') : '';

          return (
            <th
              key={String(col.id ?? col.accessorKey)}
              className={cn(
                'font-semibold text-slate-700',
                sizeClass,
                alignToClass((col as any).align),
                (col as any).headerClassName, // รองรับการใส่คลาสเฉพาะหัวคอลัมน์
              )}
              style={{ minWidth: (col as any).width ?? defaultColMinWidth, whiteSpace: 'nowrap' }}
              aria-sort={isActive ? (isDesc ? 'descending' : 'ascending') : 'none'}
              scope="col"
            >
              {/* ใช้ปุ่มภายใน th เพื่อควบคุม sort */}
              <button
                type="button"
                onClick={() => onToggleSort?.(col)}
                className="inline-flex items-center gap-1 bg-transparent font-semibold text-slate-700 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ border: 'none', cursor: 'pointer' }}
                aria-pressed={isActive}
                aria-label={
                  isActive
                    ? `Sort by ${colId} ${isDesc ? 'descending' : 'ascending'}`
                    : `Sort by ${colId}`
                }
              >
                {col.header}
                <span aria-hidden>{indicator}</span>
              </button>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

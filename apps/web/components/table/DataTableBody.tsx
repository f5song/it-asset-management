
// src/components/datatable/DataTableBody.tsx
'use client';

import { cn } from 'components/ui';
import React from 'react';
import { AppColumnDef } from 'types';


type Props<T extends { id?: string | number }> = {
  columns: AppColumnDef<T>[];
  rows: readonly T[];
  onRowActivate: (row: T) => void;
  variant: 'default' | 'striped';
  size: 'xs' | 'sm' | 'md';
  defaultColMinWidth: number;

  /** ✅ ช่องนำหน้า (เช่น checkbox) — ส่งเฉพาะ content แล้วตารางจะห่อ <td> ให้เอง */
  renderLeadingCell?: (row: T, rowIndex: number) => React.ReactNode;
};

export function DataTableBody<T extends { id?: string | number }>({
  columns,
  rows,
  onRowActivate,
  variant,
  size,
  defaultColMinWidth,
  renderLeadingCell,
}: Props<T>) {
  const rowBase =
    'border-b border-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-blue-300';
  const rowHover = 'hover:bg-slate-50';
  const rowStriped = variant === 'striped' ? 'odd:bg-slate-50' : '';

  const tdSize = {
    xs: 'px-2 py-1 text-[12px]',
    sm: 'px-3 py-2 text-[13px]',
    md: 'px-3 py-2 text-[14px]',
  }[size];

  const alignToClass = (align?: 'left' | 'center' | 'right') =>
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  // ป้องกัน row-activate เมื่อ target เป็น element interactive
  const isInteractive = (el: HTMLElement | null) =>
    !!el?.closest('button,a,input,textarea,select,label,[role="button"]');

  return (
    <tbody className="bg-white">
      {rows.map((row, ri) => {
        const key = (row.id ?? ri) as React.Key;

        const handleRowClick: React.MouseEventHandler<HTMLTableRowElement> = (e) => {
          if (isInteractive(e.target as HTMLElement)) return;
          onRowActivate(row);
        };

        const handleRowKeyDown: React.KeyboardEventHandler<HTMLTableRowElement> = (e) => {
          if (isInteractive(e.target as HTMLElement)) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onRowActivate(row);
          }
        };

        return (
          <tr
            key={key}
            className={cn(rowBase, rowHover, rowStriped, 'cursor-pointer')}
            tabIndex={0}
            onClick={handleRowClick}
            onKeyDown={handleRowKeyDown}
          >
            {/* ✅ คอลัมน์นำหน้า */}
            {renderLeadingCell && (
              <td className={cn(tdSize, 'w-10 align-middle')} onClick={(e) => e.stopPropagation()}>
                {renderLeadingCell(row, ri)}
              </td>
            )}

            {columns.map((c) => {
              const value = (row as any)[c.accessorKey as any];
              const cellKey = String(c.id ?? c.accessorKey ?? `col-${ri}`);

              return (
                <td
                  key={cellKey}
                  className={cn(
                    tdSize,
                    'text-slate-900',
                    alignToClass((c as any).align),
                    (c as any).cellClassName,
                  )}
                  style={{ minWidth: (c as any).width ?? defaultColMinWidth, whiteSpace: 'nowrap' }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (isInteractive(target)) e.stopPropagation();
                  }}
                >
                  {typeof c.cell === 'function' ? c.cell(value, row, ri) : String(value ?? '')}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}

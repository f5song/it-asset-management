
'use client';

import React from 'react';
// ใช้ AppColumnDef จากที่คุณประกาศกลาง (ถ้าคุณย้ายไปที่ 'types/table' ก็เปลี่ยน path ตรงนี้)
import type { AppColumnDef } from '../../types';
import { cn } from '../ui';

type Props<T extends { id?: string | number }> = {
  columns: AppColumnDef<T>[];
  rows: readonly T[];                 // ✅ รองรับ readonly เพื่อความยืดหยุ่น
  onRowActivate: (row: T) => void;
  variant: 'default' | 'striped';
  size: 'xs' | 'sm' | 'md';
  defaultColMinWidth: number;
};

export function DataTableBody<T extends { id?: string | number }>({
  columns,
  rows,
  onRowActivate,
  variant,
  size,
  defaultColMinWidth,
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

  return (
    <tbody className="bg-white">
      {rows.map((row, ri) => {
        const key = (row.id ?? ri) as React.Key;
        return (
          <tr
            key={key}
            className={cn(rowBase, rowHover, rowStriped, 'cursor-pointer')}
            tabIndex={0}
            onClick={() => onRowActivate(row)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onRowActivate(row);
            }}
          >
            {columns.map((c) => {
              const value = (row as any)[c.accessorKey as any];
              return (
                <td
                  key={String(c.id)}
                  className={cn(
                    tdSize,
                    'text-slate-900',
                    alignToClass((c as any).align),
                    (c as any).cellClassName, // ถ้า AppColumnDef ของคุณมี field นี้
                  )}
                  style={{ minWidth: c.width ?? defaultColMinWidth, whiteSpace: 'nowrap' }}
                  // ป้องกันปุ่ม/ลิงก์ภายในเซลล์ทำให้แถว trigger navigate
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('button,a,[role="button"]')) e.stopPropagation();
                  }}
                >
                  {c.cell ? c.cell(value, row, ri) : String(value ?? '')}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}

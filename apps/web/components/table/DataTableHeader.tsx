
// src/components/datatable/DataTableHeader.tsx
'use client';

import React from 'react';
import { ColumnDef, SortingState } from '../../types';
import { cn } from '../ui';


type Props<T> = {
  columns: ColumnDef<T>[];
  sorting?: SortingState<T>;
  onToggleSort?: (col: ColumnDef<T>) => void;
  size: 'xs' | 'sm' | 'md';
  defaultColMinWidth: number;
};

export function DataTableHeader<T>({
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

  return (
    <thead className="sticky top-0 z-10 bg-slate-50">
      <tr>
        {columns.map((col) => {
          const active = sorting?.sortBy === col.accessorKey;
          const indicator = active ? (sorting?.sortOrder === 'desc' ? ' 🔽' : ' 🔼') : '';

          return (
            <th
              key={col.id}
              className={cn('font-semibold text-slate-700', sizeClass, alignToClass(col.align), col.headerClassName)}
              style={{ minWidth: col.width ?? defaultColMinWidth, whiteSpace: 'nowrap' }}
              aria-sort={active ? (sorting?.sortOrder === 'desc' ? 'descending' : 'ascending') : 'none'}
              scope="col"
            >
              <button
                type="button"
                onClick={() => onToggleSort?.(col)}
                className="bg-transparent font-semibold"
                style={{ border: 'none', cursor: 'pointer' }}
                aria-pressed={active}
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

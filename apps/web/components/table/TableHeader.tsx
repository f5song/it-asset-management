
'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef as TSColumnDef,
  type SortingState as TSSortingState,
} from '@tanstack/react-table';

type Props<T> = {
  columns: TSColumnDef<T>[];
  data: T[];
};

export function TanStackTable<T>({ columns, data }: Props<T>) {
  const [sorting, setSorting] = React.useState<TSSortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
      {/* Header */}
      <div style={{ overflowX: 'auto', borderBottom: '1px solid #e5e7eb' }}>
        <table style={{ minWidth: 1200, width: '100%' }}>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    {h.column.getCanSort() ? (
                      <button onClick={h.column.getToggleSortingHandler()} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[h.column.getIsSorted() as 'asc' | 'desc'] ?? ''}
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        </table>
      </div>

      {/* Body (scroll แนวตั้ง/แนวนอน) */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 420 }}>
        <table style={{ minWidth: 1200, width: '100%' }}>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
``

// src/lib/tables/requestColumns.tsx
import type { AppColumnDef } from '@/types/ui-table';
import type { RequestItem } from '@/types/exception';
import { formatDue } from '../date';


export const requestColumns: AppColumnDef<RequestItem>[] = [
  {
    id: 'id',
    header: 'ID',
    accessorKey: 'id',
    width: 96,
    cell: (value) => (
      <span className="font-medium text-slate-800 tabular-nums">#{String(value)}</span>
    ),
    getSortValue: (row) => row.id,
  },
  {
    id: 'title',
    header: 'Title',
    accessorKey: 'title',
    width: 360,
    cell: (_value, row) => (
      <div className="flex flex-col">
        {/* แสดงเฉพาะชื่อ ไม่ต้องเติม #id แล้ว */}
        <div className="truncate font-medium text-slate-900">{row.title}</div>
        <div className="truncate text-xs text-slate-500">
          Requester: <span className="text-slate-700">{row.requester}</span>
          <span className="mx-2 text-slate-300">•</span>
          Dept: <span className="text-slate-700">{row.department}</span>
        </div>
      </div>
    ),
    getSortValue: (row) => row.title,
  },
  {
    id: 'dueAt',
    header: 'Due',
    accessorKey: 'dueAt',
    width: 140,
    cell: (value) => <span className="text-slate-800">{formatDue(String(value))}</span>,
    getSortValue: (row) => row.dueAt,
  },
  {
    id: 'site',
    header: 'Site',
    accessorKey: 'site',
    width: 140,
    cell: (value) => <span className="text-slate-800">{String(value)}</span>,
    getSortValue: (row) => row.site,
  },
  {
    id: 'exception',
    header: 'Exceptions',
    accessorKey: 'exception',
    width: 180,
    cell: (value) => <span className="truncate text-slate-800">{String(value)}</span>,
    getSortValue: (row) => row.exception,
  },
  {
    id: 'risk',
    header: 'Risk',
    accessorKey: 'risk',
    width: 110,
    cell: (value) => (
      <span className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1',
        value === 'High'
          ? 'bg-red-50 text-red-700 ring-red-100'
          : value === 'Medium'
          ? 'bg-amber-50 text-amber-700 ring-amber-100'
          : 'bg-green-50 text-green-700 ring-green-100',
      ].join(' ')}>{String(value)}</span>
    ),
    getSortValue: (row) => row.risk,
  },
];

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export type FilterBarProps<TStatus extends string, TType extends string> = {
  // Filters
  statusFilter?: TStatus;
  setStatusFilter: (s?: TStatus) => void;

  typeFilter?: TType;
  setTypeFilter: (t?: TType) => void;

  manufacturerFilter?: string;
  setManufacturerFilter: (m?: string) => void;

  searchText: string;
  setSearchText: (t: string) => void;

  // Actions
  onExport: (fmt: 'CSV' | 'XLSX' | 'PDF') => void;
  onAdd?: () => void;

  // Options
  statusOptions?: readonly TStatus[];
  typeOptions?: readonly TType[];
  manufacturerOptions?: readonly string[];
};

export function FilterBar<TStatus extends string, TType extends string>({
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  manufacturerFilter,
  setManufacturerFilter,
  searchText,
  setSearchText,
  onExport,
  onAdd,
  statusOptions = [] as readonly TStatus[],
  typeOptions = [] as readonly TType[],
  manufacturerOptions = [] as readonly string[],
}: FilterBarProps<TStatus, TType>) {
  const [exportOpen, setExportOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-3">
      {/* แถวบน: Filters + Export + Add */}
      <div className="flex gap-3 items-center">
        {/* Status */}
        <select
          className="border rounded px-3 py-2"
          value={statusFilter ?? ''}
          onChange={(e) =>
            setStatusFilter(e.target.value ? (e.target.value as TStatus) : undefined)
          }
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Type */}
        <select
          className="border rounded px-3 py-2"
          value={typeFilter ?? ''}
          onChange={(e) =>
            setTypeFilter(e.target.value ? (e.target.value as TType) : undefined)
          }
        >
          <option value="">All Types</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Manufacturer */}
        <select
          className="border rounded px-3 py-2"
          value={manufacturerFilter ?? ''}
          onChange={(e) => setManufacturerFilter(e.target.value || undefined)}
        >
          <option value="">All Manufacturers</option>
          {manufacturerOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Export dropdown */}
        <div className="relative ml-auto">
          <button
            className="border rounded px-3 py-2 bg-gray-100"
            onClick={() => setExportOpen((v) => !v)}
          >
            Export ▾
          </button>
          {exportOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow">
              {(['CSV', 'XLSX', 'PDF'] as const).map((fmt) => (
                <div
                  key={fmt}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onExport(fmt);
                    setExportOpen(false);
                  }}
                >
                  {fmt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add button */}
        {onAdd && (
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded"
            onClick={onAdd}
          >
            Add
          </button>
        )}
      </div>

      {/* แถวล่าง: Search */}
      <div className="flex items-center gap-2 border rounded px-3 py-2 bg-white">
        <span role="img" aria-label="search">
          🔍
        </span>
        <input
          className="flex-1 outline-none"
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
    </div>
  );
}

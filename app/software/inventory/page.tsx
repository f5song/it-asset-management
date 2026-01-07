'use client';
// src/pages/ItemsPage.tsx
import { ColumnDef, DataTable } from '@/components/table/DataTable';
import { useItemsTable } from '@/hooks/useItemsTable';
import { Item, ItemStatus } from '@/mock/mockSoftware';
import { PaginationState, SortingState } from '@/types/table';
import React, { useState } from 'react';

const columns: ColumnDef<Item>[] = [
  { id: 'softwareName', header: 'Software Name', accessorKey: 'softwareName', width: 200 },
  { id: 'manufacturer', header: 'Manufacturer', accessorKey: 'manufacturer', width: 160 },
  { id: 'version', header: 'Version', accessorKey: 'version', width: 100 },
  { id: 'category', header: 'Category', accessorKey: 'category', width: 140 },
  { id: 'policyCompliance', header: 'Policy Compliance', accessorKey: 'policyCompliance', width: 160 },
  { id: 'expiryDate', header: 'Expiry Date', accessorKey: 'expiryDate', width: 140 },
  { id: 'status', header: 'Status', accessorKey: 'status', width: 120 },
  // เพิ่มคอลัมน์จากภาพที่สอง
  { id: 'softwareType', header: 'Software Type', accessorKey: 'softwareType', width: 140 },
  { id: 'licenseModel', header: 'License Model', accessorKey: 'licenseModel', width: 140 },
  { id: 'clientServer', header: 'Client/Server', accessorKey: 'clientServer', width: 140 },
];

export default function SoftwarePage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 });
  const [sorting, setSorting] = useState<SortingState<Item>>({
    sortBy: 'softwareName',
    sortOrder: 'asc',
  });

  const [statusFilter, setStatusFilter] = useState<ItemStatus | undefined>(undefined);

  const { rows, totalRows, isLoading, isError, errorMessage } = useItemsTable({
    pagination,
    sorting,
    statusFilter,
  });

  return (
    <div style={{ padding: 16 }}>
      <h1 className='text-3xl font-semibold mb-6'>Software Inventory</h1>
      {/* Filter bar (ย่อ ๆ) */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <label>
          Status:{' '}
          <select
            value={statusFilter ?? ''}
            onChange={(e) =>
              setStatusFilter(e.target.value ? (e.target.value as ItemStatus) : undefined)
            }
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Expiring">Expiring</option>
          </select>
        </label>
      </div>

      <DataTable<Item>
        columns={columns}
        rows={rows}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        variant="striped"
        emptyMessage="ไม่พบรายการ"
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        maxBodyHeight={420}          // ถ้าตารางยาวจะ scroll แนวตั้ง
      />
    </div>
  );
}

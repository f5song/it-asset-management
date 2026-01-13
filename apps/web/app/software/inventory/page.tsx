"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef, DataTable } from "../../../components/table/DataTable";
import { useItemsTable } from "../../../hooks/useItemsTable";
import { FilterBar } from "../../../components/ui/FilterBar";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import type {
  SoftwareItem,
  SoftwareStatus,
  SoftwareType,
} from "../../../types";
import { PageHeader } from "../../../components/ui/PageHeader";

/** ----------------------------
 * 1) กำหนดคอลัมน์ตาราง
 * ---------------------------- */
const columns: ColumnDef<SoftwareItem>[] = [
  {
    id: "softwareName",
    header: "Software Name",
    accessorKey: "softwareName",
    width: 200,
  },
  {
    id: "manufacturer",
    header: "Manufacturer",
    accessorKey: "manufacturer",
    width: 160,
  },
  { id: "version", header: "Version", accessorKey: "version", width: 100 },
  { id: "category", header: "Category", accessorKey: "category", width: 140 },
  {
    id: "policyCompliance",
    header: "Policy Compliance",
    accessorKey: "policyCompliance",
    width: 160,
  },
  {
    id: "expiryDate",
    header: "Expiry Date",
    accessorKey: "expiryDate",
    width: 140,
  },
  { id: "status", header: "Status", accessorKey: "status", width: 120 },
  // เพิ่มจากภาพที่สอง
  {
    id: "softwareType",
    header: "Software Type",
    accessorKey: "softwareType",
    width: 140,
  },
  {
    id: "licenseModel",
    header: "License Model",
    accessorKey: "licenseModel",
    width: 140,
  },
  {
    id: "clientServer",
    header: "Client/Server",
    accessorKey: "clientServer",
    width: 140,
  },
];

/** ----------------------------
 * 2) แปลง SortingState (v8) → รูปแบบเก่าสำหรับ useItemsTable (ถ้าฮุคยังใช้แบบเดิม)
 *    - v8: SortingState = Array<{ id: string; desc: boolean }>
 *    - legacy: { sortBy: string; sortOrder: 'asc' | 'desc' }
 * ---------------------------- */
function sortingToLegacy(sorting: SortingState | undefined): {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} {
  if (!Array.isArray(sorting) || sorting.length === 0) return {};
  const first = sorting[0];
  return {
    sortBy: first.id,
    sortOrder: first.desc ? "desc" : "asc",
  };
}

export default function SoftwarePage() {
  /** ---------- ฟิลเตอร์ (single source of truth) ---------- */
  const [status, setStatus] = useState<SoftwareStatus | undefined>(undefined);
  const [type, setType] = useState<SoftwareType | undefined>();
  const [mfgr, setMfgr] = useState<string | undefined>();
  const [searchText, setSearchText] = useState("");

  /** ---------- ตาราง ---------- */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });

  // ✅ ใช้ SortingState (v8) ที่เป็น array
  const [sorting, setSorting] = useState<SortingState>([
    { id: "softwareName", desc: false }, // เริ่มต้น sort ที่ softwareName → asc
  ]);

  // Adapter สำหรับ hook ถ้าฮุคยังต้องการรูปแบบเดิม
  const legacySorting = useMemo(() => sortingToLegacy(sorting), [sorting]);

  /** ---------- ดึงข้อมูลพร้อมฟิลเตอร์ ---------- */
  const { rows, totalRows, isLoading, isError, errorMessage } = useItemsTable({
    pagination,
    // ❗ ถ้า useItemsTable รองรับ v8 แล้ว ให้ส่ง sorting: SortingState ได้เลย
    // sorting,
    // ❗ ถ้ายังเป็นแบบเก่า ให้ส่ง legacySorting แทน
    sorting: legacySorting,
    statusFilter: status,
    typeFilter: type,
    manufacturerFilter: mfgr,
    searchText,
  });

  /** ---------- Action handlers ---------- */
  const handleExport = (fmt: "CSV" | "XLSX" | "PDF") => {
    // TODO: ใส่ logic export จริง (client หรือ server)
    console.log("Export as:", fmt);
  };

  const handleAddSoftware = () => {
    // TODO: เปิด modal หรือไปหน้า create
    console.log("Add Software clicked");
  };

  return (
    <div style={{ padding: 6 }}>
      <PageHeader
        title="Software Inventory"
        breadcrumbs={[
          { label: "Software Inventory", href: "/software/inventory" },
        ]}
      />

      {/* Filter Bar */}
      <FilterBar
        statusFilter={status}
        setStatusFilter={setStatus}
        typeFilter={type}
        setTypeFilter={setType}
        manufacturerFilter={mfgr}
        setManufacturerFilter={setMfgr}
        searchText={searchText}
        setSearchText={setSearchText}
        onExport={handleExport}
        onAddSoftware={handleAddSoftware}
      />

      {/* DataTable */}
      <DataTable<SoftwareItem>
        columns={columns}
        rows={rows}
        totalRows={totalRows}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting} // ✅ ส่ง v8 sorting ให้ตาราง
        onSortingChange={setSorting} // ✅ ตารางจะ toggle asc/desc ผ่านฟังก์ชันนี้
        variant="striped"
        emptyMessage="ไม่พบรายการ"
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        maxBodyHeight={420}
      />
    </div>
  );
}

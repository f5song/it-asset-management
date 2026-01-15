"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";

import { ColumnDef, LicenseItem } from "../../../types";
import { useLicenseInventory } from "../../../hooks/useLicenseInventory";
import { PageHeader } from "../../../components/ui/PageHeader";
import { FilterBar } from "../../../components/ui/FilterBar";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { formatDate } from "../../../utils/date";
import { DataTable } from "../../../components/table";

// ----------------------------
// 1) กำหนดคอลัมน์ตาราง (ตามโดเมน License)
//    - เพิ่ม cell ที่เป็น <a> สำหรับ softwareName
//    - จัด format วันที่/สถานะ เพื่ออ่านง่าย
// ----------------------------
const columns: ColumnDef<LicenseItem>[] = [
  {
    id: "softwareName",
    header: "Software Name",
    accessorKey: "softwareName",
    width: 220,
    // ✅ คลิกชื่อลิงก์เพื่อเปิดหน้ารายละเอียด (เปิดแท็บใหม่ได้)
    cell: (v, row) => (
      <a
        href={`/software/license-management/${row.id}`}
        onClick={(e) => e.stopPropagation()} // ป้องกันกระทบ onRowClick ของแถว
        style={{
          color: "inherit", // ใช้สีตาม parent (ไม่เป็นสีฟ้า)
          textDecoration: "none", // ลบเส้นใต้
          cursor: "pointer", // คง cursor แบบลิงก์
        }}
      >
        {String(v ?? "-")}
      </a>
    ),
  },
  {
    id: "manufacturer",
    header: "Manufacturer",
    accessorKey: "manufacturer",
    width: 160,
  },
  {
    id: "licenseType",
    header: "License Type",
    accessorKey: "licenseType",
    width: 140,
  },
  { id: "total", header: "Total License", accessorKey: "total", width: 120 },
  { id: "inUse", header: "In Use", accessorKey: "inUse", width: 100 },
  {
    id: "available",
    header: "Available",
    accessorKey: "available",
    width: 100,
  },
  {
    id: "expiryDate",
    header: "Expiry Date",
    accessorKey: "expiryDate",
    width: 140,
    cell: (v) => formatDate(typeof v === "string" ? v : undefined),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    width: 120,
    cell: (v, r) => <StatusBadge label={r.status ?? v ?? "-"} />,
  },
];

// ----------------------------
// 2) หน้า License (Client-side filtering + sorting + pagination)
// ----------------------------
export default function LicenseManagementPage() {
  /** ---------- ใช้ฮุค inventory (client-side dataset + filtering) ---------- */
  const {
    filters,
    setFilter,
    rows,
    pageSize,
    manufacturerOptions,
    licenseTypeOptions,
    statusOptions,
    total,
  } = useLicenseInventory(8); // default page size = 8

  /** ---------- ตาราง: pagination/sorting ---------- */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // เริ่มต้น sort ตามชื่อซอฟต์แวร์ (asc)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "softwareName", desc: false },
  ]);

  /** ---------- ทำให้ sorting “มีผลจริง” (client-side sort) ---------- */
  const sortedRows = useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) return rows;
    if (!sorting || sorting.length === 0) return rows;

    const [{ id, desc }] = sorting;

    // ใช้ id ของคอลัมน์ (เราเซ็ตให้ตรงกับคีย์ใน row อยู่แล้ว)
    const getVal = (r: LicenseItem) => (r as any)?.[id];

    // คอมแพร์ที่รองรับ number / date / string / undefined
    const cmp = (a: any, b: any) => {
      if (a == null && b == null) return 0;
      if (a == null) return -1;
      if (b == null) return 1;

      // ถ้าเป็นตัวเลข
      if (typeof a === "number" && typeof b === "number") {
        return a - b;
      }

      // ถ้าเป็นวัน (string/Date ที่ parse ได้)
      const da = new Date(a);
      const db = new Date(b);
      const aIsDate = !isNaN(da.valueOf());
      const bIsDate = !isNaN(db.valueOf());
      if (aIsDate && bIsDate) return da.getTime() - db.getTime();

      // อื่นๆ เทียบเป็น string (case-insensitive)
      return String(a).localeCompare(String(b), undefined, {
        sensitivity: "base",
      });
    };

    const copy = [...rows];
    copy.sort((ra, rb) => {
      const result = cmp(getVal(ra), getVal(rb));
      return desc ? -result : result;
    });
    return copy;
  }, [rows, sorting]);

  /** ---------- Client-side paginate หลังจาก sort แล้ว ---------- */
  const start = pagination.pageIndex * pagination.pageSize;
  const end = start + pagination.pageSize;
  const pageRows = useMemo(
    () => sortedRows.slice(start, end),
    [sortedRows, start, end]
  );

  /** ---------- รีเซ็ตหน้าเมื่อมีการเปลี่ยน filter / dataset ---------- */
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [filters, rows.length]);

  /** ---------- Action handlers ---------- */
  const handleExport = (fmt: "CSV" | "XLSX" | "PDF") => {
    console.log("Export as:", fmt);
  };
  const handleAddLicense = () => {
    console.log("Add License clicked");
  };

  return (
    <div style={{ padding: 6 }}>
      <PageHeader
        title="License Management"
        breadcrumbs={[
          { label: "Software Inventory", href: "/software/inventory" },
          { label: "License Management", href: "/software/license-management" },
        ]}
      />

      {/* Filter Bar — ใช้ string-based filters เหมือน useSoftwareInventory */}
      <FilterBar<string, string>
        // map manufacturer
        manufacturerFilter={filters.manufacturer}
        setManufacturerFilter={(v) =>
          setFilter({ manufacturer: v ?? "All manufacturer" })
        }
        // status
        statusFilter={filters.status}
        setStatusFilter={(v) => setFilter({ status: v ?? "All Status" })}
        // licenseType
        typeFilter={filters.licenseType}
        setTypeFilter={(v) =>
          setFilter({ licenseType: v ?? "All License Type" })
        }
        // search
        searchText={filters.search}
        setSearchText={(t) => setFilter({ search: t })}
        // actions
        onExport={handleExport}
        onAdd={handleAddLicense}
        // dropdown options
        statusOptions={["All Status", ...statusOptions] as const}
        typeOptions={["All License Type", ...licenseTypeOptions] as const}
        manufacturerOptions={
          ["All manufacturer", ...manufacturerOptions] as const
        }
      />

      {/* DataTable */}
      <DataTable<LicenseItem>
        columns={columns}
        rows={pageRows}
        totalRows={total}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        variant="striped"
        emptyMessage="ไม่พบรายการ"
        isLoading={false}
        isError={false}
        errorMessage={undefined}
        maxBodyHeight={420}
        // ✅ ทำให้คลิกทั้งแถวแล้วนำทางไปหน้า Detail ตาม id
        rowHref={(row) => `/software/license-management/${row.id}`}
      />
    </div>
  );
}

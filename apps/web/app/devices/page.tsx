
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";

import { PageHeader } from "../../components/ui/PageHeader";
import { FilterBar, type SimpleFilters } from "../../components/ui/FilterBar";
import { DataTable } from "../../components/table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { ExportFormat, ToolbarAction } from "../../types/tab";

// ถ้า ColumnDef ถูก export จาก "../../../types" ในโปรเจกต์ของพี่ ให้ import แบบนั้น
// ที่นี่ผมใส่ type ColumnDef ให้ DataTable ทำงานได้ (ถ้าโปรเจกต์พี่มีอยู่แล้ว ให้ลบบรรทัดนี้)
import type { ColumnDef } from "../../types";
import { sortingToLegacy, useDeviceInventory } from "../../hooks/useDeviceInventory";
import { DeviceItem } from "../../types/device";



// ------- Columns -------
const columns: ColumnDef<DeviceItem>[] = [
  { id: "id", header: "Device ID", accessorKey: "id", width: 140 },
  { id: "name", header: "Device Name", accessorKey: "name", width: 220 },
  { id: "type", header: "Type", accessorKey: "type", width: 120 },
  { id: "assignedTo", header: "Assigned to", accessorKey: "assignedTo", width: 200 },
  { id: "os", header: "OS", accessorKey: "os", width: 140 },
  {
    id: "compliance",
    header: "Compliant status",
    accessorKey: "compliance",
    width: 160,
    cell: (v) => <StatusBadge label={String(v ?? "-")} />,
  },
  {
    id: "lastScan",
    header: "Last Scan",
    accessorKey: "lastScan",
    width: 140,
  },
];


export default function DevicesPage() {
  /** ---------- ใช้ฮุค inventory ---------- */
  const {
    filters,
    setFilter,
    rows,            // ทั้งชุดข้อมูล (หลังกรองแล้ว)
    pageSize,
    deviceGroupOptions,
    deviceTypeOptions,
    osOptions,
    total,           // จำนวนทั้งหมดหลังกรอง
  } = useDeviceInventory(8);

  /** ---------- ตาราง: pagination/sorting ---------- */
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "id", desc: false }, // เริ่มต้นเรียงตาม Device ID
  ]);

  const legacySorting = useMemo(() => sortingToLegacy(sorting), [sorting]);

  /** ---------- ทำให้ sorting “มีผลจริง” (client-side sort) ---------- */
  const sortedRows = useMemo(() => {
    if (!Array.isArray(rows) || rows.length === 0) return rows;
    if (!sorting || sorting.length === 0) return rows;

    const [{ id, desc }] = sorting;
    const getVal = (r: DeviceItem) => (r as any)?.[id];

    const cmp = (a: any, b: any) => {
      if (a == null && b == null) return 0;
      if (a == null) return -1;
      if (b == null) return 1;

      if (typeof a === "number" && typeof b === "number") return a - b;

      // date
      const da = new Date(a);
      const db = new Date(b);
      const aIsDate = !isNaN(da.valueOf());
      const bIsDate = !isNaN(db.valueOf());
      if (aIsDate && bIsDate) return da.getTime() - db.getTime();

      return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
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
  const pageRows = useMemo(() => sortedRows.slice(start, end), [sortedRows, start, end]);

  /** ---------- รีเซ็ตหน้าเมื่อมีการเปลี่ยน filter / dataset ---------- */
  React.useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [filters, rows.length]);

  /** ---------- Adapter: map filters (domain) <-> FilterBar(Simple) ---------- */
  // ใน Device: มี 3 ฟิลเตอร์ตามภาพ: Device (ซ้าย), Type (กลาง), OS (ขวา)
  // ใช้ FilterBar(Simple) โดย map:
  // - status     -> deviceGroup (label: All Device)
  // - type       -> deviceType  (label: All Type)
  // - manufacturer -> os        (label: All OS)
  const toSimpleFilters = React.useCallback((): SimpleFilters<string, string> => {
    return {
      status: filters.deviceGroup && filters.deviceGroup !== "All Device" ? filters.deviceGroup : undefined,
      type: filters.deviceType && filters.deviceType !== "All Type" ? filters.deviceType : undefined,
      manufacturer: filters.os && filters.os !== "All OS" ? filters.os : undefined,
      searchText: filters.search ?? "",
    };
  }, [filters]);

  const fromSimpleFilters = React.useCallback(
    (sf: SimpleFilters<string, string>) => {
      setFilter({
        deviceGroup: sf.status ?? "All Device",
        deviceType: sf.type ?? "All Type",
        os: sf.manufacturer ?? "All OS",
        search: sf.searchText ?? "",
      });
    },
    [setFilter]
  );

  const simpleFilters = useMemo(() => toSimpleFilters(), [toSimpleFilters]);

  /** ---------- Actions ---------- */
  const handleExport = (fmt: ExportFormat) => {
    console.log("Export as:", fmt.toUpperCase());
    // TODO: เรียกดาวน์โหลดไฟล์จริงตาม fmt ('csv' | 'xlsx' | 'pdf')
  };

  const handleAction = (act: ToolbarAction) => {
      console.log("Add Software on device page"); 
  };

  return (
    <div style={{ padding: 6 }}>
      <PageHeader
        title="Devices"
        breadcrumbs={[{ label: "Devices", href: "/devices" }]}
      />

      {/* Filter Bar — โครงเดียวกับ License */}
      <FilterBar<string, string>
        filters={simpleFilters}
        onFiltersChange={fromSimpleFilters}
        statusOptions={deviceGroupOptions as readonly string[]}
        typeOptions={deviceTypeOptions as readonly string[]}
        manufacturerOptions={osOptions as readonly string[]}
        onExport={handleExport}
        onAction={handleAction}
        allStatusLabel="All Device"
        allTypeLabel="All Type"
        allManufacturerLabel="All OS"
      />

      {/* DataTable */}
      <DataTable<DeviceItem>
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
        // คลิกทั้งแถวเพื่อดูรายละเอียดอุปกรณ์ (แก้ path ตามระบบจริง)
        rowHref={(row) => `/devices/${row.id}`}
      />
    </div>
  );
}

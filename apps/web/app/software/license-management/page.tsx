
// src/pages/software/license-management/page.tsx
"use client";

import * as React from "react";
import { InventoryPageShell } from "components/inventory/InventoryPageShell";
import { StatusBadge } from "components/ui/StatusBadge";
import { useServerTableController } from "hooks/useServerTableController";
import { useLicenseInventory } from "hooks/useLicenseInventory";
import { formatDate } from "lib/date";

import type {
  ColumnDef,
  SimpleFilters,
  LicenseItem,
  LicenseFilters,
  LicenseStatus,
  LicenseModel
} from "types";

// helper: แปลง "" เป็น undefined
const toUndef = <T extends string | undefined>(v: T | ""): T | undefined =>
  v === "" ? undefined : v;

// ✅ สร้าง normalizer: Label -> internal value ที่ service ต้องการ
const normalizeStatus = (s?: string): string => {
  if (!s) return "";
  const map: Record<string, string> = {
    Active: "Active",
    Expired: "Expired",
    Expiring: "Expiring",
  };
  return map[s] ?? s.toLowerCase();
};

const normalizeLicenseModel = (m?: string): string => {
  if (!m) return "";
  const map: Record<string, string> = {
    "Per-User": "Per-User",
    "Per-Device": "Per-Device",
    Subscription: "Subscription",
    Perpetual: "Perpetual",
    Concurrent: "Concurrent",
  };
  return map[m] ?? m.toLowerCase();
};

export default function LicenseManagementPage() {
  // ฟิลเตอร์เริ่มเป็น undefined (ชัดว่าคือ "ไม่กรอง")
  const [filters, setFilters] = React.useState<LicenseFilters>({
    status: undefined,
    licenseModel: undefined,
    manufacturer: undefined,
    search: "",
  });

  // columns memo
  const columns = React.useMemo<ColumnDef<LicenseItem>[]>(() => [
    {
      id: "softwareName",
      header: "Software Name",
      accessorKey: "softwareName",
      width: 220,
      cell: (v, row) => (
        <a
          href={`/software/license-management/${row.id}`}
          onClick={(e) => e.stopPropagation()}
          style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}
        >
          {String(v ?? "-")}
        </a>
      ),
    },
    { id: "manufacturer", header: "Manufacturer", accessorKey: "manufacturer", width: 160 },
    { id: "licenseModel", header: "License Model", accessorKey: "licenseModel", width: 140 },
    { id: "total", header: "Total License", accessorKey: "total", width: 120 },
    { id: "inUse", header: "In Use", accessorKey: "inUse", width: 100 },
    { id: "available", header: "Available", accessorKey: "available", width: 100 },
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
      cell: (v, r) => <StatusBadge label={(r.status ?? v ?? "-") as string} />,
    },
  ], []);

  // Bridge: Domain <-> Simple (strongly-typed)
  const toSimple = React.useCallback(
    (): SimpleFilters<LicenseStatus, LicenseModel> => ({
      status: toUndef(filters.status as LicenseStatus | ""),
      type: toUndef(filters.licenseModel as LicenseModel | ""),
      manufacturer: toUndef(filters.manufacturer as string | ""),
      searchText: filters.search ?? "",
    }),
    [filters]
  );

  const fromSimple = React.useCallback(
    (sf: SimpleFilters<LicenseStatus, LicenseModel>): LicenseFilters => ({
      status: toUndef(sf.status),
      licenseModel: toUndef(sf.type),
      manufacturer: toUndef(sf.manufacturer),
      search: sf.searchText ?? "",
    }),
    []
  );

  // Controller (server-side)
  const ctl = useServerTableController<
    LicenseItem,
    LicenseStatus,
    LicenseModel,
    LicenseFilters
  >({
    pageSize: 10,
    defaultSort: { id: "softwareName", desc: false },
    domainFilters: filters,
    setDomainFilters: setFilters,
    toSimple,
    fromSimple,
    resetDeps: [filters.status, filters.licenseModel, filters.manufacturer],
  });

  // ✅ สร้าง serviceFilters จาก simpleFilters (normalize เป็นค่าภายใน)
  const serviceFilters = React.useMemo(
    () => ({
      status: normalizeStatus(ctl.simpleFilters.status as string | undefined),
      licenseModel: normalizeLicenseModel(ctl.simpleFilters.type as string | undefined),
      manufacturer: (ctl.simpleFilters.manufacturer as string | undefined) ?? "",
      search: ctl.simpleFilters.searchText ?? "",
    }),
    [ctl.simpleFilters]
  );

  // ✅ เรียก hook พร้อมส่ง filters เข้าไปด้วย
  const {
    rows,
    totalRows,
    isLoading,
    isError,
    errorMessage,
    statusOptions,
    licenseModelOptions,
    manufacturerOptions,
  } = useLicenseInventory(ctl.serverQuery, serviceFilters);

  const getRowHref = React.useCallback(
    (row: LicenseItem) => `/software/license-management/${row.id}`,
    []
  );

  return (
    <InventoryPageShell<LicenseItem, LicenseStatus, LicenseModel>
      title="License Management"
      breadcrumbs={[
        { label: "Software Inventory", href: "/software/inventory" },
        { label: "License Management", href: "/software/license-management" },
      ]}
      // FilterBar
      filters={ctl.simpleFilters}
      onFiltersChange={ctl.onSimpleFiltersChange}
      statusOptions={statusOptions}
      typeOptions={licenseModelOptions}
      manufacturerOptions={manufacturerOptions}
      allStatusLabel="All Status"
      allTypeLabel="All License Types"
      allManufacturerLabel="All Manufacturers"

      // DataTable
      columns={columns}
      rows={rows}
      totalRows={totalRows}
      pagination={ctl.pagination}
      onPaginationChange={ctl.setPagination}
      sorting={ctl.sorting}
      onSortingChange={ctl.setSorting}
      rowHref={getRowHref}

      // States
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
    />
  );
}

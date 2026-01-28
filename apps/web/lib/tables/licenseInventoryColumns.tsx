// src/lib/tables/licenseColumns.ts
import * as React from "react";
import type { AppColumnDef } from "types/ui-table";
import type { LicenseItem } from "types";
import { StatusBadge } from "components/ui/StatusBadge";
import { formatDate } from "lib/date";

export const licenseColumns: AppColumnDef<LicenseItem>[] = [
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
];
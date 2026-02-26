// src/lib/tables/employeeAssignmentColumns.ts
import type { AppColumnDef } from "types/ui-table";
import { show } from "lib/show";
import type { EmployeeAssignmentRow } from "@/types";
import { formatDateTH } from "../date";

export const employeeAssignmentColumns: AppColumnDef<EmployeeAssignmentRow>[] =
  [
    // Identity
    {
      id: "id",
      header: "ID",
      accessorKey: "id",
      cell: (value) => show(value ?? "—"),
    },

    // License context
    {
      id: "licenseName",
      header: "License",
      accessorKey: "licenseName",
      cell: (value) => show(value ?? "—"),
    },

    // Assignment attributes
    {
      id: "assignmentStatus",
      header: "Assignment Status",
      accessorKey: "assignmentStatus",
      cell: (value) => show(value ?? "—"),
    },
    {
      id: "assignedAt",
      header: "Assigned At",
      accessorKey: "assignedAt",
      getSortValue: (row) => row.assignedAt ?? "",
      cell: (value) => formatDateTH(value as string | null | undefined),
    },
    {
      id: "assignedBy",
      header: "Assigned By",
      accessorKey: "assignedBy",
      cell: (value) => show(value ?? "—"),
    },
    {
      id: "expiresAt",
      header: "Expires At",
      accessorKey: "expiresAt",
      getSortValue: (row) => row.expiresAt ?? "",
      cell: (value) => formatDateTH(value as string | null | undefined),
    },

    // Device binding
    {
      id: "deviceId",
      header: "Device",
      accessorKey: "deviceId",
      cell: (value) => show(value ?? "—"),
    },

    // Keys / Evidence
    {
      id: "licenseKey",
      header: "License Key",
      accessorKey: "licenseKey",
      cell: (value) => show(value ?? "—"),
    },
    {
      id: "scannedLicenseKey",
      header: "Scanned License",
      accessorKey: "scannedLicenseKey",
      cell: (value) => show(value ?? "—"),
    },
  ];

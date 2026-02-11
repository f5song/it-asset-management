// src/lib/tables/employeeAssignmentColumns.ts
import type { AppColumnDef } from "types/ui-table";
import { show } from "lib/show";
import type { EmployeeAssignmentRow } from "@/types";

export const employeeAssignmentColumns: AppColumnDef<EmployeeAssignmentRow>[] = [
  {
    id: "deviceName",
    header: "Device",
    accessorKey: "deviceName",
    cell: (value) => show(value),
  },
  {
    id: "userName",
    header: "User",
    accessorKey: "userName",
    cell: (value) => show(value),
  },
  {
    id: "licenseStatus",
    header: "License Status",
    accessorKey: "licenseStatus",
    cell: (value) => show(value ?? "—"),
  },
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
  {
    id: "workStation",
    header: "Workstation",
    accessorKey: "workStation",
    cell: (value) => show(value ?? "—"),
  },
];
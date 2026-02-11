// lib/tables/licenseInstallationColumns.ts
import { show } from "lib/show";
import type { LicenseInstallationRow } from "types";
import type { AppColumnDef } from "types/ui-table";

// ถ้าต้องการ format วันที่ อาจประกาศ formatter เหมือนอีกไฟล์:
// const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "—");

export const installationColumns: AppColumnDef<LicenseInstallationRow>[] = [
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
    cell: (value, row) => show(value ?? (row as LicenseInstallationRow).licenseStatus ?? "Active"),
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
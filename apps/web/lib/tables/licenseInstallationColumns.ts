// src/lib/tables/licenseInstallationColumns.ts
import { show } from "lib/show";
import type { LicenseInstallationRow } from "types";
import type { AppColumnDef } from "types/ui-table";

// ช่วยแปลง ISO -> Local date (ถ้าไม่มีค่า แสดง "—")
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—");

export const installationColumns: AppColumnDef<LicenseInstallationRow>[] = [
  { id: "id", header: "ID", accessorKey: "id", cell: (v) => show((v as string | null | undefined) ?? "—") },

  { id: "userName", header: "User", accessorKey: "userName", cell: (v) => show((v as string | null | undefined) ?? "—") },
  { id: "userEmail", header: "Email", accessorKey: "userEmail", cell: (v) => show((v as string | null | undefined) ?? "—") },
  { id: "department", header: "Department", accessorKey: "department", cell: (v) => show((v as string | null | undefined) ?? "—") },

  { id: "workStation", header: "Workstation", accessorKey: "workStation", cell: (v) => show((v as string | null | undefined) ?? "—") },


  { id: "assignedAt", header: "Assigned At", accessorKey: "assignedAt", cell: (v) => show(fmtDate(v as string | null | undefined)) },
  { id: "assignedBy", header: "Assigned By", accessorKey: "assignedBy", cell: (v) => show((v as string | null | undefined) ?? "—") },
  { id: "expiresAt", header: "Expires At", accessorKey: "expiresAt", cell: (v) => show(fmtDate(v as string | null | undefined)) },

  { id: "deviceName", header: "Device", accessorKey: "deviceName", cell: (v) => show((v as string | null | undefined) ?? "—") },

 
];
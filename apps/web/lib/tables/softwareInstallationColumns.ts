import { show } from "lib/show";
import type { InstallationRow } from "types";
import type { AppColumnDef } from "types/ui-table";

// แนะนำ: ถ้าอยากแสดงวันที่สวยขึ้น สามารถเปลี่ยน formatter ตรงนี้ได้
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "—");

export const softwareInstallationColumns: AppColumnDef<InstallationRow>[] = [
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
    id: "department",
    header: "Department",
    accessorKey: "department",
    cell: (value) => show(value ?? "—"),
  },
  {
    id: "version",
    header: "Version",
    accessorKey: "version",
    cell: (value) => show(value ?? "—"),
  },
  {
    id: "installDate",
    header: "Install Date",
    accessorKey: "installDate",
    cell: (value) => show(fmtDate(value as string | undefined)),
  },
  {
    id: "lastSeen",
    header: "Last Seen",
    accessorKey: "lastSeen",
    cell: (value) => show(fmtDate(value as string | undefined)),
  },
  {
    id: "workStation",
    header: "Workstation",
    accessorKey: "workStation",
    cell: (value) => show(value ?? "—"),
  },
];
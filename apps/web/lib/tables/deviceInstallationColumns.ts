import { show } from "lib/show";
import type { DeviceInstallationRow } from "types";
import type { AppColumnDef } from "types/ui-table";

export const deviceInstallationColumns: AppColumnDef<DeviceInstallationRow>[] = [
  {
    id: "softwareName",
    header: "Software",
    accessorKey: "softwareName",
    cell: (value) => show(value),
  },
  {
    id: "manufacturer",
    header: "Manufacturer",
    accessorKey: "manufacturer",
    cell: (value) => show(value),
  },
  {
    id: "version",
    header: "Version",
    accessorKey: "version",
    cell: (value) => show(value),
  },
  {
    id: "category",
    header: "Category",
    accessorKey: "category",
    cell: (value) => show(value),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    // ถ้าไม่มีค่า ให้ fallback เป็น "Active" ตามเดิม
    cell: (value) => show((value as string) ?? "Active"),
  },
];
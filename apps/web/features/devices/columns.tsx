
// src/features/devices/columns.tsx  (ต้องเป็น .tsx เพราะมี JSX ใน cell)
import { StatusBadge } from "../../components/ui/StatusBadge";
import type { ColumnDef } from "../../types";
import type { DeviceItem } from "../../types/device";

export const deviceColumns: ColumnDef<DeviceItem>[] = [
  { id: "id",         header: "Device ID",    accessorKey: "id",         width: 140 },
  { id: "name",       header: "Device Name",  accessorKey: "name",       width: 220 },
  { id: "type",       header: "Type",         accessorKey: "type",       width: 120 },
  { id: "assignedTo", header: "Assigned to",  accessorKey: "assignedTo", width: 200 },
  { id: "os",         header: "OS",           accessorKey: "os",         width: 140 },
  {
    id: "compliance",
    header: "Compliant status",
    accessorKey: "compliance",
    width: 160,
    cell: (v) => <StatusBadge label={String(v ?? "-")} />,
  },
  { id: "lastScan",   header: "Last Scan",    accessorKey: "lastScan",   width: 140 },
];

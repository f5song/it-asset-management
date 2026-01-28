import { StatusBadge } from "components/ui/StatusBadge";
import { type DeviceItem, type AppColumnDef } from "types";

export const deviceInventoryColumns: AppColumnDef<DeviceItem>[] = [
  { id: "id", header: "Device ID", accessorKey: "id", width: 140 },
  { id: "name", header: "Device Name", accessorKey: "name", width: 220 },
  { id: "type", header: "Type", accessorKey: "type", width: 120 },
  { id: "assignedTo", header: "Assigned To", accessorKey: "assignedTo", width: 200 },
  { id: "os", header: "OS", accessorKey: "os", width: 140 },
  {
    id: "compliance",
    header: "Compliance",
    accessorKey: "compliance",
    width: 160,
    // ใช้ signature (value, row) ตาม AppColumnDef ของคุณ
    cell: (value /* unknown */, _row /* DeviceItem */) => (
      <StatusBadge label={String(value ?? "-")} variant="compliance" />
    ),
  },
  { id: "lastScan", header: "Last Scan", accessorKey: "lastScan", width: 140 },
];

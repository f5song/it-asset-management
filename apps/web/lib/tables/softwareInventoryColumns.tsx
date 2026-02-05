import type { AppColumnDef } from "types/ui-table";
import type { SoftwareItem } from "types";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const softwareColumns: AppColumnDef<SoftwareItem>[] = [
  {
    id: "softwareName",
    header: "Software Name",
    accessorKey: "softwareName",
    width: 200,
  },
  {
    id: "manufacturer",
    header: "Manufacturer",
    accessorKey: "manufacturer",
    width: 160,
  },
  { id: "version", header: "Version", accessorKey: "version", width: 100 },
  { id: "category", header: "Category", accessorKey: "category", width: 140 },
  {
    id: "policyCompliance",
    header: "Policy Compliance",
    accessorKey: "policyCompliance",
    width: 160,
    // ใช้ signature (value, row) ตาม AppColumnDef ของคุณ
    cell: (value /* unknown */, _row /* DeviceItem */) => (
      <StatusBadge label={String(value ?? "-")} variant="compliance" />
    ),
  },
  
  {
    id: "expiryDate",
    header: "Expiry Date",
    accessorKey: "expiryDate",
    width: 140,
  },
  {
    id: "softwareType",
    header: "Software Type",
    accessorKey: "softwareType",
    width: 140,
    cell: (value /* unknown */, _row /* DeviceItem */) => (
      <StatusBadge label={String(value ?? "-")} variant="softwareType" />
    ),
  },
  {
    id: "licenseModel",
    header: "License Model",
    accessorKey: "licenseModel",
    width: 140,
  },
  {
    id: "clientServer",
    header: "Client/Server",
    accessorKey: "clientServer",
    width: 140,
  },
];

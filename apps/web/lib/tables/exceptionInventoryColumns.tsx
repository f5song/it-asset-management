import { StatusBadge } from "components/ui/StatusBadge";
import type { AppColumnDef } from "types";
import type { ExceptionItem } from "types/exception";

export const exceptionInventoryColumns: AppColumnDef<ExceptionItem>[] = [
  { id: "id", header: "Exception ID", accessorKey: "id", width: 140 },
  { id: "name", header: "Exception Name", accessorKey: "name", width: 240 },
  { id: "category", header: "Category", accessorKey: "category", width: 160 },
  { id: "scope", header: "Scope", accessorKey: "scope", width: 140 },
  { id: "target", header: "Target", accessorKey: "target", width: 220 },
  { id: "owner", header: "Owner", accessorKey: "owner", width: 180 },
  {
    id: "group",
    header: "Status",
    accessorKey: "group",
    width: 160,
    cell: (value) => (
      <StatusBadge label={String(value ?? "-")} variant="exception" />
    ),
  },
  { id: "expiresAt", header: "Expires", accessorKey: "expiresAt", width: 160 },
  { id: "createdAt", header: "Created", accessorKey: "createdAt", width: 180 },
];

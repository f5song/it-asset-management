// lib/tables/exceptionInventoryColumns.ts
import type { ExceptionDefinition } from "types/exception";
import { show } from "lib/show";
import { formatDate } from "lib/date";
import { StatusBadge } from "components/ui/StatusBadge";
import { AppColumnDef } from "@/types";

export const exceptionInventoryColumns: AppColumnDef<ExceptionDefinition>[] = [
  {
    id: "id",
    header: "ID",
    accessorKey: "id",
    getSortValue: (row) => row.id,
    cell: (value) => show(value as string),
  },
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    getSortValue: (row) => row.name,
    cell: (value) => show(value as string),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    getSortValue: (row) => row.status,
    cell: (value) => <StatusBadge label={show(value as string)} variant="exception" />,
  },
  {
    id: "risk",
    header: "Risk",
    accessorKey: "risk",
    getSortValue: (row) => row.risk ?? "",
    cell: (value) => show(value as string),
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorKey: "createdAt",
    getSortValue: (row) => row.createdAt ?? "",
    cell: (value) => formatDate(value as string | null | undefined),
  },
  {
    id: "notes",
    header: "Notes",
    accessorKey: "notes",
    getSortValue: (row) => row.notes ?? "",
    cell: (value) => show(value as string),
  },
];
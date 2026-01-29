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
    id: "category",
    header: "Category",
    accessorKey: "category",
    getSortValue: (row) => row.category,
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
    id: "owner",
    header: "Owner",
    accessorKey: "owner",
    getSortValue: (row) => row.owner ?? "",
    cell: (value) => show(value as string),
  },
  {
    id: "assignments",
    header: "Assignments",
    accessorKey: "totalAssignments",
    getSortValue: (row) => row.totalAssignments ?? 0,
    cell: (_value, row) => {
      const active = row.activeAssignments ?? 0;
      const total = row.totalAssignments ?? 0;
      return `${active}/${total}`;
    },
    align: "right",
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorKey: "createdAt",
    getSortValue: (row) => row.createdAt ?? "",
    cell: (value) => formatDate(value as string | null | undefined),
  },
  {
    id: "reviewAt",
    header: "Review At",
    accessorKey: "reviewAt",
    getSortValue: (row) => row.reviewAt ?? "",
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
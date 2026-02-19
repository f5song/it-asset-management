// lib/tables/exceptionInventoryColumns.ts
import type { ExceptionDefinitionRow } from "types/exception";
import { show } from "lib/show";
import { formatDateTH } from "lib/date";
import { StatusBadge } from "components/ui/StatusBadge";
import type { AppColumnDef } from "@/types";

export const exceptionInventoryColumns: AppColumnDef<ExceptionDefinitionRow>[] = [
  {
    id: "exception_id",
    header: "Exception Id",
    accessorKey: "exception_id",                 // ✅ key มีอยู่จริงใน ExceptionDefinitionRow
    getSortValue: (row) => row.exception_id,
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
    accessorKey: "risk",                          // ✅ ใน type ใช้ 'risk' (ไม่ใช่ risk_level)
    getSortValue: (row) => row.risk ?? "",
    cell: (value) => show(value as string),
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorKey: "createdAt",                     // ✅ คุณ map camelCase แล้ว
    getSortValue: (row) => row.createdAt ?? "",
    cell: (value) => formatDateTH(value as string | null | undefined),
  },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
    getSortValue: (row) => row.description ?? "",
    cell: (value) => show(value as string),
  },
];
// lib/tables/exceptionInventoryColumns.ts
import type { ExceptionDefinition } from "types/exception";
import { show } from "lib/show";
import { formatDateTH } from "lib/date";
import { StatusBadge } from "components/ui/StatusBadge";
import type { AppColumnDef } from "@/types";

export const exceptionInventoryColumns: AppColumnDef<ExceptionDefinition>[] = [
  {
    id: "exception_id",
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
    id: "risk_level",
    header: "Risk",
    accessorKey: "risk", // ← ตรวจให้ตรงกับ type: ถ้าใน type คือ risk_level ให้เปลี่ยนเป็น "risk_level"
    getSortValue: (row) => row.risk ?? "",
    cell: (value) => show(value as string),
  },
  {
    id: "created_at",
    header: "Created At",
    accessorKey: "createdAt", // ← ตรวจให้ตรงกับ type: ถ้า backend ส่ง created_at และคุณ map ไว้แล้ว ก็ OK
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
// src/lib/tables/exceptionAssignmentColumns.tsx
import type { AppColumnDef } from "types/ui-table";
import { StatusBadge } from "components/ui/StatusBadge";
import { show } from "lib/show";
import { formatDateTH } from "lib/date";
import type { ExceptionAssignmentRow } from "types/exception";

/**
 * Columns สำหรับแท็บ Assignments ของ Exception (User-only)
 */
export const exceptionAssignmentColumns: AppColumnDef<ExceptionAssignmentRow>[] = [
  {
    id: "employeeId",
    header: "Employee ID",
    accessorKey: "employeeId",
    cell: (value) => show(value),
  },
  {
    id: "employeeName",
    header: "Name",
    accessorKey: "employeeName",
    cell: (value) => show(value),
  },
  {
    id: "department",
    header: "Department",
    accessorKey: "department",
    cell: (value) => show(value),
  },
  {
    id: "assignedBy",
    header: "Assigned By",
    accessorKey: "assignedBy",
    cell: (value) => show(value),
  },
  {
    id: "assignedAt",
    header: "Assigned At",
    accessorKey: "assignedAt",
    cell: (value) => show(formatDateTH(value as string | Date | undefined)),
  },
  {
    id: "expiresAt",
    header: "Expires At",
    accessorKey: "expiresAt",
    cell: (value) => show(formatDateTH(value as string | Date | undefined)),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    // ใช้ value จาก accessorKey โดยตรง หรือจะอ้างจาก row ก็ได้
    cell: (value, _row) => <StatusBadge label={show(value)} variant="exception" />,
  },
  {
    id: "notes",
    header: "Notes",
    accessorKey: "notes",
    cell: (value) => show(value),
  },
];
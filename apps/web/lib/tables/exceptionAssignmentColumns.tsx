// src/lib/tables/exceptionAssignmentColumns.tsx
import type { AppColumnDef } from "types/ui-table";
import { StatusBadge } from "components/ui/StatusBadge";
import { show } from "lib/show";
import { formatDateTH } from "lib/date";
import type { ExceptionAssignmentRow } from "types/exception";

export const exceptionAssignmentColumns: AppColumnDef<ExceptionAssignmentRow>[] = [
  {
    id: "employeeId",
    header: "Employee ID",
    accessorKey: "employeeId", // แค่ให้ผ่าน type
    cell: (_value, row: any) => show(row.emp_code ?? row.employeeId),
  },
  {
    id: "employeeName",
    header: "Name",
    accessorKey: "employeeName",
    cell: (_value, row: any) =>
      show([row.name_th, row.surname_th].filter(Boolean).join(" ").trim() || row.employeeName),
  },
  {
    id: "department",
    header: "Department",
    accessorKey: "department",
    cell: (_value, row: any) => show(row.department_name ?? row.department),
  },
  {
    id: "assignedBy",
    header: "Assigned By",
    accessorKey: "assignedBy",
    cell: (_value, row: any) => show(row.assigned_by ?? row.assignedBy),
  },
  {
    id: "assignedAt",
    header: "Assigned At",
    accessorKey: "assignedAt",
    cell: (_value, row: any) => show(formatDateTH(row.assigned_at ?? row.assignedAt)),
  },
  {
    id: "expiresAt",
    header: "Expires At",
    accessorKey: "expiresAt",
    cell: (_value, row: any) => show(formatDateTH(row.valid_to ?? row.expiresAt)),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: (_value, row: any) => (
      <StatusBadge label={show(row.status)} variant="exception" />
    ),
  },

  // (ถ้าต้องการโชว์ข้อมูลเพิกถอนด้วย)
  {
    id: "revokedAt",
    header: "Revoked At",
    accessorKey: "revokedAt",
    cell: (_value, row: any) => {
      const out = formatDateTH(row.revoked_at ?? row.revokedAt);
      return show(out || null);
    },
  },
  {
    id: "revokedBy",
    header: "Revoked By",
    accessorKey: "revokedBy",
    cell: (_value, row: any) => show(row.revoked_by ?? row.revokedBy ?? ""),
  },

  // {
  //   id: "notes",
  //   header: "Notes",
  //   accessorKey: "notes",
  //   cell: (_value, row: any) => show(row.notes ?? ""),
  // },
];
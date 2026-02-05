// src/lib/tables/exceptionAssignmentColumns.tsx
import type { ReactNode } from "react";
import { StatusBadge } from "components/ui/StatusBadge";
import { show } from "lib/show";
import { formatDateTH } from "lib/date";
import type { ExceptionAssignmentRow } from "types/exception";

/**
 * Columns สำหรับแท็บ Assignments ของ Exception (User-only)
 */
export const exceptionAssignmentColumns = [
  {
    header: "Employee ID",
    accessor: (r: ExceptionAssignmentRow): ReactNode => show(r.employeeId),
  },
  {
    header: "Name",
    accessor: (r: ExceptionAssignmentRow): ReactNode => show(r.employeeName),
  },
  {
    header: "Department",
    accessor: (r: ExceptionAssignmentRow): ReactNode => show(r.department),
  },
  {
    header: "Assigned By",
    accessor: (r: ExceptionAssignmentRow): ReactNode => show(r.assignedBy),
  },
  {
    header: "Assigned At",
    accessor: (r: ExceptionAssignmentRow): ReactNode =>
      show(formatDateTH(r.assignedAt)),
  },
  {
    header: "Expires At",
    accessor: (r: ExceptionAssignmentRow): ReactNode =>
      show(formatDateTH(r.expiresAt)),
  },
  {
    header: "Status",
    accessor: (r: ExceptionAssignmentRow): ReactNode => (
      <StatusBadge label={show(r.status)} variant="exception" />
    ),
  },
  {
    header: "Notes",
    accessor: (r: ExceptionAssignmentRow): ReactNode => show(r.notes),
  },
];

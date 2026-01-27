// src/lib/tables/employeeColumns.ts
import * as React from "react";
import type { AppColumnDef } from "types/ui-table";
import type { Employees } from "types/employees";
import { StatusBadge } from "components/ui/StatusBadge";

export const employeeColumns: AppColumnDef<Employees>[] = [
  { id: "id", header: "Employee ID", accessorKey: "id", width: 140 },
  { id: "name", header: "Employee Name", accessorKey: "name", width: 220 },
  { id: "department", header: "Department", accessorKey: "department", width: 180 },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    width: 140,
    cell: (v) => <StatusBadge label={String(v ?? "-")} />,
  },
];
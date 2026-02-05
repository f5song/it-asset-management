// src/lib/tables/employeeColumns.ts
import * as React from "react";
import type { AppColumnDef } from "types/ui-table";

import { StatusBadge } from "components/ui/StatusBadge";
import { EmployeeItem } from "@/types";

export const employeeColumns: AppColumnDef<EmployeeItem>[] = [
  { id: "id", header: "Employee ID", accessorKey: "id", width: 140 },
  { id: "name", header: "Employee Name", accessorKey: "name", width: 220 },
  { id: "department", header: "Department", accessorKey: "department", width: 180 },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    width: 140,
    cell: (v) => <StatusBadge label={String(v ?? "-")} variant="employees"/>,
  },
];
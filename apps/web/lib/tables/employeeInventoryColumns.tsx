import type { EmployeeItem } from "@/types/employees";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AppColumnDef } from "@/types";
import { fullNameTh } from "../name"; // ← มีอยู่แล้วใน lib ของคุณ
// ถ้ามี fullNameEn / fullName() ก็ import มาได้เช่นกัน

export const employeeColumns: AppColumnDef<EmployeeItem>[] = [
  { id: "id", header: "Employee ID", accessorKey: "id", width: 140 },

  // ---------- Employee Name (ต่อ first + last ใน cell) ----------
  {
    id: "employeeName",
    header: "Employee Name",
    // ใช้อะไรก็ได้ที่เป็น keyof จริง เพื่อให้ตารางมี value เบื้องต้น
    accessorKey: "firstNameTh",
    width: 220,
    // cell(value, row)
    cell: (_value, row) => {
      const e = row as EmployeeItem;
      const display = fullNameTh(e);
      return <span className="font-medium">{display}</span>;
    },
  },

  // ---------- สถานะ ----------
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    width: 140,
    // cell(value, row)
    cell: (value) => <StatusBadge label={String(value ?? "-")} variant="employees" />,
  },

  // ---------- ประเภทพนักงาน ----------
  { id: "empType", header: "Employee Type", accessorKey: "empType", width: 160 },

  // ---------- ข้อมูลติดต่อ ----------
  { id: "email", header: "Email", accessorKey: "email", width: 220 },
  { id: "phone", header: "Phone", accessorKey: "phone", width: 140 },

  // ---------- ตำแหน่ง/องค์กร ----------
  { id: "position", header: "Position", accessorKey: "position", width: 180 },
  { id: "company", header: "Company", accessorKey: "company", width: 160 },
  { id: "department", header: "Department", accessorKey: "department", width: 180 },
  { id: "section", header: "Section", accessorKey: "section", width: 160 },
  { id: "unit", header: "Unit", accessorKey: "unit", width: 160 },
];
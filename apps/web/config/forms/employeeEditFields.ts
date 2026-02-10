import type { EmployeesEditValues } from "types/employees";
import type { FormField } from "types/forms";
import type { EmployeeStatus, EmployeeType } from "types/employees";

/** helper: สร้าง options จาก union ของ string */
const toOptions = <T extends string>(arr: readonly T[]) =>
  arr.map((v) => ({ label: v, value: v }));

/**
 * ✅ กำหนดชุดตัวเลือกสถานะให้ตรงกับโดเมนของคุณ
 * - ถ้าในระบบคุณใช้ "Active" | "Resigned" → ใช้ชุดนี้
 * - ถ้าหน้าอื่นอยากใช้ "Active" | "Inactive" ก็เปลี่ยนชุดนี้ให้ตรง หรือแยกเป็นไฟล์ config ต่อโดเมน
 */
export const EMPLOYEE_STATUS_OPTIONS: readonly EmployeeStatus[] = [
  "Active",
  "Resigned",
] as const;

/**
 * ✅ ตัวอย่างชุดตัวเลือกประเภทพนักงาน (ปรับให้ตรงกับ type ของคุณ)
 * - ถ้าใน `EmployeeType` ของคุณมีค่าอื่น ๆ ให้แก้ตามจริง
 */
export const EMPLOYEE_TYPE_OPTIONS: readonly EmployeeType[] = [
  "Permanent",
  "Contract",
] as const;

/**
 * ✅ ฟิลด์สำหรับหน้าแก้ไขพนักงาน (Edit) ที่ "ตรงตาม" EmployeesEditValues
 */
export const employeesEditFields: FormField<
  keyof EmployeesEditValues & string
>[] = [
  {
    name: "firstNameTh",
    label: "First Name (TH)",
    type: "text",
    required: true,
  },
  {
    name: "lastNameTh",
    label: "Last Name (TH)",
    type: "text",
    required: true,
  },

  // ===== สถานะ / ประเภทพนักงาน =====
  {
    name: "status",
    label: "Status",
    type: "select",
    options: toOptions(EMPLOYEE_STATUS_OPTIONS),
    required: true,
  },
  {
    name: "empType",
    label: "Employee Type",
    type: "select",
    options: toOptions(EMPLOYEE_TYPE_OPTIONS),
    // ไม่ required ตาม type (empType?: EmployeeType)
  },

  // ===== ข้อมูลติดต่อ/งาน =====
  {
    name: "phone",
    label: "Phone Number",
    type: "text",
    placeholder: "e.g. 0812345678",
  },
  {
    name: "position",
    label: "Position",
    type: "text",
    placeholder: "e.g. Software Engineer",
  },

  // ===== โครงสร้างหน่วยงาน =====
  {
    name: "company",
    label: "Company",
    type: "text",
  },
  {
    name: "department",
    label: "Department",
    type: "text",
  },
  {
    name: "section",
    label: "Section",
    type: "text",
  },
  {
    name: "unit",
    label: "Unit",
    type: "text",
  },

  // ===== อุปกรณ์หลัก (อาจ null ได้) =====
  {
    name: "device",
    label: "Assigned Device",
    type: "select",
    // หมายเหตุ: ถ้าต้องการรวม "None" เป็นค่า null ในฟอร์ม
    // ให้ handle ที่ layer ของ form (แปลง "None" -> null ตอน submit)
    options: [
      { label: "None", value: "None" },
      { label: "Laptop", value: "Laptop" },
      { label: "Desktop", value: "Desktop" },
    ],
  },
];
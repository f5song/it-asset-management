import React from "react";
import { z } from "zod";

import { FormPage } from "../../../components/ui/FormPage";
import BackButton from "../../../components/ui/BackButton";
import { FormField } from "types/forms";

// หากคุณมี enum อยู่แล้ว สามารถ import มาใช้แทน string literal ได้ เช่น:
// import { EmployeeStatus } from "types/employees";

/**
 * Schema สำหรับเพิ่มพนักงานใหม่
 * - บังคับกรอก: name, department, status
 * - email/phone/notes เป็นออปชัน
 */
const schema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อพนักงาน"),
  department: z.string().min(1, "กรุณาเลือกแผนก"),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
  email: z
    .string()
    .email("อีเมลไม่ถูกต้อง")
    .optional()
    .or(z.literal("")), // อนุญาตให้เว้นว่าง
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "เบอร์โทรไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
  notes: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof schema>;

const defaultValues: EmployeeFormValues = {
  name: "",
  department: "",
  status: "",
  email: "",
  phone: "",
  notes: "",
};

const fields: FormField<keyof EmployeeFormValues & string>[] = [
  {
    name: "name",
    label: "Employee Name",
    placeholder: "เช่น Jane Doe",
    type: "text",
    required: true,
    colSpan: 1,
  },
  {
    name: "notes",
    label: "Notes",
    placeholder: "รายละเอียดเพิ่มเติม เช่น สัญญาจ้างชั่วคราว/สลับกะ",
    type: "textarea",
    colSpan: 1,
  },
  {
    name: "department",
    label: "Department",
    type: "select",
    required: true,
    colSpan: 1,
    options: [
      { label: "Engineering", value: "engineering" },
      { label: "Design", value: "design" },
      { label: "Finance", value: "finance" },
      { label: "HR", value: "hr" },
      { label: "Operations", value: "operations" },
      { label: "Sales", value: "sales" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    colSpan: 1,
    // ถ้าคุณใช้ enum EmployeeStatus ให้ map จาก enum แทน
    options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
      { label: "Contractor", value: "Contractor" },
      { label: "Intern", value: "Intern" },
    ],
  },
  {
    name: "email",
    label: "Email",
    placeholder: "name@example.com",
    type: "text",
    colSpan: 1,
  },
  {
    name: "phone",
    label: "Phone",
    placeholder: "เช่น 080-123-4567",
    type: "text",
    colSpan: 1,
  },
];

export default function AddEmployeePage() {
  return (
    <div style={{ padding: 6 }}>
      <BackButton />
      <FormPage<EmployeeFormValues>
        title="Add Employee"
        breadcrumbs={[
          { label: "Employees", href: "/employees" },
          { label: "Add Employee" },
        ]}
        sectionTitle="Employee Information"
        schema={schema}
        defaultValues={defaultValues}
        fields={fields}
        submitLabel="Create Employee"
        cancelLabel="Cancel"
        onSubmit={async (data) => {
          // TODO: เรียก API สร้างพนักงานใหม่ เช่น await employeesService.create(data)
          console.log("submit employee:", data);
          alert("Employee created");
        }}
        onCancel={() => {
          // TODO: นำทางกลับหน้า Employees (next/navigation → useRouter().push('/employees'))
          alert("Canceled");
        }}
      />
    </div>
  );
}

"use client";
import BackButton from "components/ui/BackButton";
import { FormPage } from "components/ui/FormPage";
import React from "react";
import { FormField } from "types/forms";
import { z } from "zod";

/**
 * Schema สำหรับเพิ่มอุปกรณ์
 * - เก็บค่าภายในของ type/os เป็น lowercase (เช่น laptop, windows)
 * - ฟิลด์ที่ไม่บังคับ เช่น assignedTo/department/notes -> optional
 */
const schema = z.object({
  deviceName: z.string().min(1, "กรุณากรอกชื่ออุปกรณ์"),
  type: z
    .enum(["laptop", "desktop", "server", "mobile", "tablet"], {
      required_error: "กรุณาเลือกประเภทอุปกรณ์",
    })
    .or(z.string().min(1, "กรุณาเลือกประเภทอุปกรณ์")),
  os: z
    .enum(["windows", "macos", "linux", "ios", "android"], {
      required_error: "กรุณาเลือกระบบปฏิบัติการ",
    })
    .or(z.string().min(1, "กรุณาเลือกระบบปฏิบัติการ")),
  assignedTo: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
});

type DeviceFormValues = z.infer<typeof schema>;

const defaultValues: DeviceFormValues = {
  deviceName: "",
  type: "" as any,
  os: "" as any,
  assignedTo: "",
  department: "",
  notes: "",
};

const fields: FormField<keyof DeviceFormValues & string>[] = [
  {
    name: "deviceName",
    label: "Device Name",
    placeholder: "เช่น PC-001 หรือ MacBook Air ของคุณ A",
    type: "text",
    required: true,
    colSpan: 1,
  },
  {
    name: "notes",
    label: "Notes",
    placeholder: "รายละเอียดเพิ่มเติม เช่น ตำแหน่งใช้งาน/ทรัพยากรพิเศษ",
    type: "textarea",
    colSpan: 1,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    required: true,
    colSpan: 1,
    options: [
      { label: "Laptop", value: "laptop" },
      { label: "Desktop", value: "desktop" },
      { label: "Server", value: "server" },
      { label: "Mobile", value: "mobile" },
      { label: "Tablet", value: "tablet" },
    ],
  },
  {
    name: "os",
    label: "Operating System",
    type: "select",
    required: true,
    colSpan: 1,
    options: [
      { label: "Windows", value: "windows" },
      { label: "macOS", value: "macos" },
      { label: "Linux", value: "linux" },
      { label: "iOS", value: "ios" },
      { label: "Android", value: "android" },
    ],
  },
  {
    name: "assignedTo",
    label: "Assigned To",
    placeholder: "เช่น ชื่อพนักงาน (ถ้ามี)",
    type: "text",
    colSpan: 1,
  },
  {
    name: "department",
    label: "Department",
    type: "select",
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
];

export default function AddDevicePage() {
  return (
    <div style={{ padding: 6 }}>
      <BackButton />
      <FormPage<DeviceFormValues>
        title="Add Device"
        breadcrumbs={[
          { label: "Devices", href: "/devices" },
          { label: "Add Device" },
        ]}
        sectionTitle="Device Information"
        schema={schema}
        defaultValues={defaultValues}
        fields={fields}
        submitLabel="Add Device"
        cancelLabel="Cancel"
        onSubmit={async (data) => {
          // TODO: เรียก API บันทึกอุปกรณ์ใหม่
          console.log("submit device:", data);
          alert("Device created");
        }}
        onCancel={() => {
          // TODO: นำทางกลับหน้า Devices
          alert("Canceled");
        }}
      />
    </div>
  );
}

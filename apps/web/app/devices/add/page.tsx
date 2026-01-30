"use client";

import React from "react";
import BackButton from "components/ui/BackButton";
import { FormPage } from "components/ui/FormPage";
import { z } from "zod";
import { FormField } from "types/forms";

/** ----------------------------------------------------------------
 * 1) กำหนดชุดค่า enum เป็น const tuple (จำเป็นสำหรับ z.enum)
 * ----------------------------------------------------------------*/
const deviceTypes = ["laptop", "desktop", "server", "mobile", "tablet"] as const;
const osTypes = ["windows", "macos", "linux", "ios", "android"] as const;

/** ----------------------------------------------------------------
 * 2) helper: รองรับค่า "" จาก <select> (placeholder) ให้เป็น undefined
 *    แล้ว validate ด้วย enum พร้อมข้อความ error ที่ต้องการ
 *    - z.enum(...) รองรับ { message } (ไม่รองรับ required_error)
 * ----------------------------------------------------------------*/
const nonEmptyEnum = <T extends readonly [string, ...string[]]>(
  values: T,
  message: string
) =>
  z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(values, { message })
  );

/** ----------------------------------------------------------------
 * 3) Schema ของฟอร์ม
 * ----------------------------------------------------------------*/
const schema = z.object({
  deviceName: z.string().min(1, "กรุณากรอกชื่ออุปกรณ์"),
  type: nonEmptyEnum(deviceTypes, "กรุณาเลือกประเภทอุปกรณ์"),
  os: nonEmptyEnum(osTypes, "กรุณาเลือกระบบปฏิบัติการ"),
  assignedTo: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
});

type DeviceFormValues = z.infer<typeof schema>;

/** ----------------------------------------------------------------
 * 4) ค่าเริ่มต้นของฟอร์ม
 *    - สำหรับ select ที่ยังไม่เลือก ให้ใส่ "" แล้ว cast ให้ TS ผ่าน
 *      (schema จะบังคับให้เลือกตอน submit)
 * ----------------------------------------------------------------*/
const defaultValues: DeviceFormValues = {
  deviceName: "",
  type: "" as unknown as (typeof deviceTypes)[number],
  os: "" as unknown as (typeof osTypes)[number],
  assignedTo: "",
  department: "",
  notes: "",
};

/** ----------------------------------------------------------------
 * 5) นิยามฟิลด์ของฟอร์ม
 *    - ใส่ placeholder option (value: "") สำหรับ select
 * ----------------------------------------------------------------*/
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
      { label: "เลือกประเภทอุปกรณ์", value: "" }, // placeholder
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
      { label: "เลือกระบบปฏิบัติการ", value: "" }, // placeholder
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

/** ----------------------------------------------------------------
 * 6) หน้าฟอร์ม
 * ----------------------------------------------------------------*/
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
          // TODO: เรียก API บันทึกอุปกรณ์ใหม่ (เช่นผ่าน axios หรือ fetch)
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
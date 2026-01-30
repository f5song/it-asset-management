"use client";
import BackButton from "components/ui/BackButton";
import { FormPage } from "components/ui/FormPage";
import React from "react";
import { FormField } from "types";
import { z } from "zod";

/** =========================================================
 * 1) Enum values เป็น const tuple (จำเป็นสำหรับ z.enum)
 *    และมี helper nonEmptyEnum รองรับค่า "" จาก select
 * ========================================================= */
const licenseModels = [
  "Per-User",
  "Per-Device",
  "Perpetual",
  "Subscription",
  "Concurrent",
] as const;

const statusValues = ["Active", "Inactive", "Expired"] as const;

/** แปลง "" (placeholder) -> undefined แล้วตรวจด้วย enum + message */
const nonEmptyEnum = <T extends readonly [string, ...string[]]>(
  values: T,
  message: string
) =>
  z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.enum(values, { message })
  );

/** =========================================================
 * 2) ตัวช่วยสำหรับ number จากฟอร์ม:
 *    - ฟอร์มส่งค่ามาเป็น string/"" เสมอ -> ใช้ preprocess/coerce
 *    - ใส่ข้อความ error ด้วย { message } แทน invalid_type_error/required_error
 * ========================================================= */

/** number integer ≥ 0 */
const nonNegativeInt = (messageInvalidNumber: string, messageInt: string, messageMin0: string) =>
  z.preprocess(
    // แปลง "" -> undefined, string ที่เป็นตัวเลข -> number
    (v) => (v === "" ? undefined : typeof v === "string" ? Number(v) : v),
    z
      .number({ message: messageInvalidNumber })
      .int({ message: messageInt })
      .min(0, { message: messageMin0 })
  );

/** number ≥ 0 (optional) */
const nonNegativeNumberOptional = (messageInvalidNumber: string, messageMin0: string) =>
  z.preprocess(
    (v) => (v === "" ? undefined : typeof v === "string" ? Number(v) : v),
    z.number({ message: messageInvalidNumber }).min(0, { message: messageMin0 }).optional()
  );

/** =========================================================
 * 3) Schema
 *    - ใช้ nonEmptyEnum สำหรับ select
 *    - ใช้ helper number สำหรับตัวเลขจากฟอร์ม
 * ========================================================= */
const schema = z
  .object({
    productName: z.string().min(1, "กรุณากรอกชื่อโปรดักต์/ซอฟต์แวร์"),
    vendor: z.string().min(1, "กรุณาเลือก/กรอกผู้ผลิต"),

    licenseModel: nonEmptyEnum(licenseModels, "กรุณาเลือกประเภทไลเซนส์"),

    total: nonNegativeInt(
      "กรุณากรอกจำนวนเป็นตัวเลข",
      "ต้องเป็นจำนวนเต็ม",
      "ต้องมากกว่าหรือเท่ากับ 0"
    ),

    inUse: nonNegativeInt(
      "กรุณากรอกจำนวนเป็นตัวเลข",
      "ต้องเป็นจำนวนเต็ม",
      "ต้องมากกว่าหรือเท่ากับ 0"
    ),

    expiryDate: z
      .string()
      .min(1, "กรุณาระบุวันหมดอายุ (YYYY-MM-DD)")
      .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)"),

    status: nonEmptyEnum(statusValues, "กรุณาเลือกสถานะ"),

    licenseCost: nonNegativeNumberOptional("กรุณากรอกจำนวนเป็นตัวเลข", "ต้องมากกว่าหรือเท่ากับ 0"),
    maintenanceCost: nonNegativeNumberOptional(
      "กรุณากรอกจำนวนเป็นตัวเลข",
      "ต้องมากกว่าหรือเท่ากับ 0"
    ),

    notes: z.string().optional(),
  })
  .refine((val) => val.inUse <= val.total, {
    message: "In Use ต้องน้อยกว่าหรือเท่ากับ Total",
    path: ["inUse"],
  });

type LicenseFormValues = z.infer<typeof schema>;

/** =========================================================
 * 4) ค่าเริ่มต้นของฟอร์ม
 *    - สำหรับ select ให้มี placeholder "" แล้ว schema จะบังคับตอน submit
 *    - number ใช้ 0 หรือ "" ก็ได้ (เรา preprocess ให้แล้ว)
 * ========================================================= */
const defaultValues: LicenseFormValues = {
  productName: "",
  vendor: "",
  licenseModel: "" as unknown as (typeof licenseModels)[number], // placeholder
  total: 0,
  inUse: 0,
  expiryDate: "",
  status: "" as unknown as (typeof statusValues)[number], // placeholder
  licenseCost: undefined,
  maintenanceCost: undefined,
  notes: "",
};

/** =========================================================
 * 5) นิยามฟิลด์
 *    - ใส่ option placeholder (value: "") สำหรับ select ทุกตัว
 * ========================================================= */
const fields = [
  {
    name: "productName",
    label: "Product Name",
    placeholder: "เช่น Adobe Photoshop",
    type: "text" as const,
    required: true,
    colSpan: 1,
  },
  {
    name: "vendor",
    label: "Vendor / Manufacturer",
    type: "select" as const,
    required: true,
    colSpan: 1,
    options: [
      { label: "เลือกผู้ผลิต", value: "" }, // placeholder
      { label: "Adobe", value: "Adobe" },
      { label: "Microsoft", value: "Microsoft" },
      { label: "Google", value: "Google" },
      { label: "JetBrains", value: "JetBrains" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    name: "licenseModel",
    label: "License Model",
    type: "select" as const,
    required: true,
    colSpan: 1,
    options: [
      { label: "เลือกประเภทไลเซนส์", value: "" }, // placeholder
      { label: "Per User", value: "Per-User" },
      { label: "Per Device", value: "Per-Device" },
      { label: "Perpetual", value: "Perpetual" },
      { label: "Subscription", value: "Subscription" },
      { label: "Concurrent", value: "Concurrent" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    required: true,
    colSpan: 1,
    options: [
      { label: "เลือกสถานะ", value: "" }, // placeholder
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
      { label: "Expired", value: "Expired" },
    ],
  },
  {
    name: "expiryDate",
    label: "Expiry Date",
    type: "date" as const,
    required: true,
    colSpan: 1,
  },
  {
    name: "total",
    label: "Total Seats",
    type: "number" as const,
    required: true,
    colSpan: 1,
    placeholder: "0",
  },
  {
    name: "inUse",
    label: "In Use",
    type: "number" as const,
    required: true,
    colSpan: 1,
    placeholder: "0",
  },
  {
    name: "licenseCost",
    label: "License Cost",
    type: "number" as const,
    colSpan: 1,
    placeholder: "เช่น 1200",
  },
  {
    name: "maintenanceCost",
    label: "Maintenance Cost",
    type: "number" as const,
    colSpan: 1,
    placeholder: "เช่น 300",
  },
  {
    name: "notes",
    label: "Notes",
    placeholder: "รายละเอียดเพิ่มเติม เช่น ช่องทางจัดซื้อ/สัญญาอ้างอิง",
    type: "textarea" as const,
    colSpan: 2,
  },
] as const satisfies ReadonlyArray<FormField<keyof LicenseFormValues>>;

/** =========================================================
 * 6) หน้า Add License
 * ========================================================= */
export default function AddLicensePage() {
  return (
    <div style={{ padding: 6 }}>
      <BackButton />
      <FormPage<LicenseFormValues>
        title="Add License"
        breadcrumbs={[
          { label: "Software Inventory", href: "/software/inventory" },
          { label: "License Management", href: "/software/license-management" },
          { label: "Add License" },
        ]}
        sectionTitle="License Information"
        schema={schema}
        defaultValues={defaultValues}
        fields={fields}
        submitLabel="Create License"
        cancelLabel="Cancel"
        onSubmit={async (data) => {
          // TODO: เรียก API สร้าง license ใหม่
          console.log("submit license:", data);
          alert("License created");
        }}
        onCancel={() => {
          // TODO: นำทางกลับหน้า License list
          alert("Canceled");
        }}
      />
    </div>
  );
}
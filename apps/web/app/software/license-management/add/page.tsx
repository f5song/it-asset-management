// src/pages/AddLicensePage.tsx
"use client";

import BackButton from "components/ui/BackButton";
import { FormPage } from "components/ui/FormPage";
import React from "react";
import { FieldDescriptor } from "types";
import { z } from "zod";

/**
 * Schema ฟอร์มเพิ่ม License ใหม่
 * - productName / vendor / licenseModel / status / expiryDate: บังคับ
 * - total / inUse: number แบบไม่ติดลบ
 * - licenseCost / maintenanceCost: number ≥ 0 (optional)
 * - notes: optional
 */
const schema = z
  .object({
    productName: z.string().min(1, "กรุณากรอกชื่อโปรดักต์/ซอฟต์แวร์"),
    vendor: z.string().min(1, "กรุณาเลือก/กรอกผู้ผลิต"),
    licenseModel: z.enum(
      ["Per-User", "Per-Device", "Perpetual", "Subscription", "Concurrent"],
      { required_error: "กรุณาเลือกประเภทไลเซนส์" },
    ),
    total: z
      .number({ invalid_type_error: "กรุณากรอกจำนวนเป็นตัวเลข" })
      .int("ต้องเป็นจำนวนเต็ม")
      .min(0, "ต้องมากกว่าหรือเท่ากับ 0"),
    inUse: z
      .number({ invalid_type_error: "กรุณากรอกจำนวนเป็นตัวเลข" })
      .int("ต้องเป็นจำนวนเต็ม")
      .min(0, "ต้องมากกว่าหรือเท่ากับ 0"),
    expiryDate: z
      .string()
      .min(1, "กรุณาระบุวันหมดอายุ (YYYY-MM-DD)")
      .refine(
        (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
        "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)",
      ),
    status: z.enum(["Active", "Inactive", "Expired"], {
      required_error: "กรุณาเลือกสถานะ",
    }),
    licenseCost: z
      .number({ invalid_type_error: "กรุณากรอกจำนวนเป็นตัวเลข" })
      .min(0, "ต้องมากกว่าหรือเท่ากับ 0")
      .optional(),
    maintenanceCost: z
      .number({ invalid_type_error: "กรุณากรอกจำนวนเป็นตัวเลข" })
      .min(0, "ต้องมากกว่าหรือเท่ากับ 0")
      .optional(),
    notes: z.string().optional(),
  })
  .refine((val) => val.inUse <= val.total, {
    message: "In Use ต้องน้อยกว่าหรือเท่ากับ Total",
    path: ["inUse"],
  });

type LicenseFormValues = z.infer<typeof schema>;

const defaultValues: LicenseFormValues = {
  productName: "",
  vendor: "",
  licenseModel: "Per-User",
  total: 0,
  inUse: 0,
  expiryDate: "",
  status: "Active",
  licenseCost: undefined,
  maintenanceCost: undefined,
  notes: "",
};

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
] as const satisfies ReadonlyArray<FieldDescriptor<keyof LicenseFormValues>>;

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
          // TODO: เรียก API สร้าง license ใหม่ เช่น licensesService.create(data)
          console.log("submit license:", data);
          alert("License created");
        }}
        onCancel={() => {
          // TODO: นำทางกลับหน้า License list (เช่น /software/license-management)
          alert("Canceled");
        }}
      />
    </div>
  );
}


// src/features/software/editFields.ts
import { EditField } from "../../types/modal";

/**
 * แบบฟอร์ม "Edit Software Detail"
 * - ตั้งชื่อ name ให้เป็น camelCase, ไม่ซ้ำ, ไม่มีช่องว่าง/ตัวพิเศษ
 * - สอดคล้องกับเลย์เอาต์ในภาพ (2 คอลัมน์สำหรับแถวล่าง)
 */
export const softwareEditFields: EditField[] = [
  {
    name: "softwareName",
    label: "Software Name",
    required: true,
    placeholder: "e.g. Google Chrome",
  },
  {
    name: "manufacturer",
    label: "Manufacturer",
    placeholder: "e.g. Google",
  },

  // แถวล่างสองคอลัมน์: Version | Category
  {
    name: "version",
    label: "Version",
    placeholder: "v120",
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    options: [
      { label: "Free", value: "free" },
      { label: "Paid", value: "paid" },
      { label: "Open Source", value: "open-source" },
    ],
    placeholder: "Select category…",
  },

  // แถวล่างสองคอลัมน์: License Type | Policy Compliance
  {
    name: "licenseType",
    label: "License Type",
    type: "select",
    required: true,
    options: [
      { label: "Free", value: "free" },
      { label: "Perpetual", value: "perpetual" },
      { label: "Subscription", value: "subscription" },
      { label: "Concurrent", value: "concurrent" },
    ],
    placeholder: "Select license type…",
  },
  {
    name: "policyCompliance",
    label: "Policy Compliance",
    type: "select",
    required: true,
    options: [
      { label: "Allowed", value: "allowed" },
      { label: "Restricted", value: "restricted" },
      { label: "Prohibited", value: "prohibited" },
    ],
    placeholder: "Select policy…",
  },
];


// src/features/software/editFields.ts
import { EditField } from "../../../types/modal";

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
      { label: "Design", value: "Design" },
      { label: "Productivity", value: "Productivity" },
      { label: "Utility", value: "Utility" },
    ],
    placeholder: "Select category…",
  },

  // แถวล่างสองคอลัมน์: License Type | Policy Compliance
  {
    name: "licenseModel",
    label: "License Model",
    type: "select",
    required: true,
    options: [
      { label: "Per-User", value: "Per-User" },
      { label: "Per-Device", value: "Per-Device" },
      { label: "Open Source", value: "Open Source" },
      { label: "Subscription", value: "Subscription" },
      { label: "Perpetual", value: "Perpetual" },
    ],
    placeholder: "Select license type…",
  },
  {
    name: "policyCompliance",
    label: "Policy Compliance",
    type: "select",
    required: true,
    options: [
      { label: "Allowed", value: "Allowed" },
      { label: "Restricted", value: "Restricted" },
      { label: "Prohibited", value: "Prohibited" },
    ],
    placeholder: "Select policy…",
  },
];


import { EditField } from "../../../types/modal";

// ✅ ชื่อ name ต้อง "ไม่ซ้ำ" และไม่มีช่องว่าง/ตัวพิเศษ
export const licenseEditFields: EditField[] = [
  { name: "productName", label: "Software Name", required: true, placeholder: "e.g. Adobe Photoshop" },
  { name: "licenseKey", label: "License Key", required: true, placeholder: "XXXX-XXXX-XXXX-XXXX" },
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
  { name: "total", label: "Total License", type: "number", required: true, placeholder: "e.g. 200" },
  { name: "inUse", label: "In Use", type: "number", required: true, placeholder: "e.g. 178" },
  { name: "expiryDate", label: "Expiry Date", type: "date", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "Active" },
      { label: "Expiring Soon", value: "Expiring Soon" },
      { label: "Expired", value: "Expired" },
      { label: "Inactive", value: "Inactive" },
    ],
    placeholder: "Select status…",
  },
  { name: "vendor", label: "Vendor", placeholder: "e.g. Adobe" },

  // 🟡 ถ้าต้องมีหลาย cost ให้ตั้งชื่อคนละตัว ห้ามซ้ำกัน
  { name: "licenseCost", label: "Cost (USD)", type: "number" },
  { name: "maintenanceCost", label: "Maintenance Cost (USD)", type: "number" },

  { name: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes…" },
];

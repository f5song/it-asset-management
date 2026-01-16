
import { EditField } from "../../types/modal";

// ✅ ชื่อ name ต้อง "ไม่ซ้ำ" และไม่มีช่องว่าง/ตัวพิเศษ
export const licenseEditFields: EditField[] = [
  { name: "productName", label: "Software Name", required: true, placeholder: "e.g. Adobe Photoshop" },
  { name: "licenseKey", label: "License Key", required: true, placeholder: "XXXX-XXXX-XXXX-XXXX" },
  {
    name: "licenseType",
    label: "License Type",
    type: "select",
    required: true,
    options: [
      { label: "Per-User", value: "per-user" },
      { label: "Per-Device", value: "per-device" },
      { label: "Concurrent", value: "concurrent" },
      { label: "Subscription", value: "subscription" },
      { label: "Perpetual", value: "perpetual" },
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
      { label: "Active", value: "active" },
      { label: "Expiring Soon", value: "expiring-soon" },
      { label: "Expired", value: "expired" },
      { label: "Inactive", value: "inactive" },
    ],
    placeholder: "Select status…",
  },
  { name: "vendor", label: "Vendor", placeholder: "e.g. Adobe" },

  // 🟡 ถ้าต้องมีหลาย cost ให้ตั้งชื่อคนละตัว ห้ามซ้ำกัน
  { name: "licenseCost", label: "Cost (USD)", type: "number" },
  { name: "maintenanceCost", label: "Maintenance Cost (USD)", type: "number" },

  { name: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes…" },
];

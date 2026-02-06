import { LicenseEditValues } from "types";
import { FormField } from "types/forms";

export const licenseEditFields: FormField<keyof LicenseEditValues & string>[] = [
  { name: "productName", label: "Software Name", required: true, placeholder: "e.g. Adobe Photoshop", type: "text" },
  { name: "licenseKey", label: "License Key", required: true, placeholder: "XXXX-XXXX-XXXX-XXXX", type: "text" },
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
  { name: "manufacturer", label: "Vendor", placeholder: "e.g. Adobe", type: "text" },

  // 🟡 ถ้าต้องมีหลาย cost ให้ตั้งชื่อคนละตัว ห้ามซ้ำกัน
  { name: "licenseCost", label: "Cost (USD)", type: "number" },
  { name: "maintenanceCost", label: "Maintenance Cost (USD)", type: "number" },

  { name: "notes", label: "Notes", type: "textarea", placeholder: "Additional notes…" },
];

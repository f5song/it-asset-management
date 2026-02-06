import { FormField, SoftwareEditValues } from "types";

export const softwareEditFields: FormField<keyof SoftwareEditValues & string>[] = [
  {
    name: "softwareName",
    label: "Software Name",
    required: true,
    placeholder: "e.g. Google Chrome",
    type: "text",
  },
  {
    name: "manufacturer",
    label: "Manufacturer",
    placeholder: "e.g. Google",
    type: "text",
  },

  // แถวล่างสองคอลัมน์: Version | Category
  {
    name: "version",
    label: "Version",
    placeholder: "v120",
    type: "text",
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

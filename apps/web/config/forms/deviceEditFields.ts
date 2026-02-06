import { DeviceEditValues } from "types";
import { FormField } from "types/forms";

export const deviceEditFields: FormField<keyof DeviceEditValues & string>[] =
  [
    { name: "name", label: "Device Name", type: "text", required: true },
    {
      name: "type",
      label: "Type",
      type: "select",
      options: ["Laptop", "Desktop", "Server", "Mobile", "Tablet"].map((v) => ({
        label: v,
        value: v.toLowerCase(),
      })),
    },
    { name: "assignedTo", label: "Assigned To", type: "text" },
    {
      name: "os",
      label: "Operating System",
      type: "select",
      options: ["Windows", "macOS", "Linux", "iOS", "Android"].map((v) => ({
        label: v,
        value: v.toLowerCase(),
      })),
    },
    {
      name: "compliance",
      label: "Compliance",
      type: "select",
      options: ["Compliant", "Non-Compliant", "Unknown"].map((v) => ({
        label: v,
        value: v.toLowerCase(),
      })),
    },
    { name: "lastScan", label: "Last Scan", type: "date" },
  ];

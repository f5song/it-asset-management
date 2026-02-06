
import { EmployeesEditValues } from "types/employees";
import { FormField } from "types/forms";

export const employeesEditFields: FormField<keyof EmployeesEditValues & string>[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
  },
  {
    name: "department",
    label: "Department",
    type: "text",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["Active", "Inactive", "Contractor", "Intern"].map((v) => ({
      label: v,
      value: v,
    })),
    required: true,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "text",
    placeholder: "e.g. 0812345678",
  },
  {
    name: "jobTitle",
    label: "Job Title",
    type: "text",
    placeholder: "e.g. Software Engineer",
  },
  {
    name: "device",
    label: "Assigned Device",
    type: "select",
    options: ["Laptop", "Desktop", "None"].map((v) => ({
      label: v,
      value: v,
    })),
  },
];

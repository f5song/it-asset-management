import { EmployeesEditValues } from "types/employees";
import { FormField } from "types/forms";

export const employeesEditFields: FormField<
  keyof EmployeesEditValues & string
>[] = [
  {
    name: "firstNameTh",
    label: "First Name",
    type: "text",
    required: true,
  },
  {
    name: "lastNameTh",
    label: "Last Name",
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
    name: "position",
    label: "Position",
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


// src/types/employees.ts

export enum EmployeeStatus {
  Active = "Active",
  Inactive = "Inactive",
  Contractor = "Contractor",
  Intern = "Intern",
}

export type Employees = {
  id: string;
  name: string;
  department: string;
  status: EmployeeStatus;
  email: string;
  jobTitle: string;
  phone: string;
};

export type EmployeesFilters = {
  department?: string;
  status?: EmployeeStatus;
  search?: string;
};

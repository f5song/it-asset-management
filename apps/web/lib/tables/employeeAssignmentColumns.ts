// src/lib/tables/employeeAssignmentColumns.ts
import type { ReactNode } from "react";
import { show } from "lib/show";

export type EmployeeAssignmentRow = {
  id: string;
  deviceName?: string;
  userName?: string;
  licenseStatus?: string;
  licenseKey?: string;
  scannedLicenseKey?: string;
  workStation?: string;
};

export const employeeAssignmentColumns = [
  { header: "Device", accessor: (r: EmployeeAssignmentRow): ReactNode => show(r.deviceName) },
  { header: "User", accessor: (r: EmployeeAssignmentRow): ReactNode => show(r.userName) },
  { header: "License Status", accessor: (r: EmployeeAssignmentRow): ReactNode => show(r.licenseStatus) },
  { header: "License Key", accessor: (r: EmployeeAssignmentRow): ReactNode => show(r.licenseKey) },
  { header: "Scanned License", accessor: (r: EmployeeAssignmentRow): ReactNode => show(r.scannedLicenseKey) },
  { header: "Workstation", accessor: (r: EmployeeAssignmentRow): ReactNode => show(r.workStation) },
];
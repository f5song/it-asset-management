
// src/types/installation.ts
import type { LicenseStatus } from "./license";

/** ฟิลเตอร์สำหรับหน้า installation (ถ้ามี) */
export type InstallationFilters = {
  user: string | "ALL";
  device: string | "ALL";
  status: "Active" | "Expiring Soon" | "Expired" | "ALL";
  query: string;
};

export type ExportFormat = "csv" | "xlsx" | "pdf";

/** แถวสำหรับแสดงผลในตาราง Installations */
export type InstallationDisplayRow = {
  id: string;
  deviceName: string;
  workStation: string;
  user: string;
  licenseKey: string;
  licenseStatus: "Active" | "Expiring Soon" | "Expired";
  scannedLicenseKey: string;
};

/** แถวสำหรับ “Assigned to Employees” */
export type AssignedDisplayRow = {
  employeeId: string;
  employeeName: string;
  department: string;
  expiryDate: string;       // ISO date string
  assignedDate: string;     //   เปลี่ยนจาก AssignedDate → camelCase
  softwareId?: string;
  softwareName?: string;
  status: LicenseStatus;
};

export type LicenseInstallationRow = {
  id: string;
  deviceName: string;                 // เดิมเคยใช้ "device"
  userName: string;                   // เดิมเคยใช้ "user"
  licenseStatus?: "Active" | "Pending" | "Expired";
  licenseKey?: string | null;
  scannedLicenseKey?: string | null;
  workStation?: string | null;
};


export interface DeviceInstallationRow {
  id: string;

  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;

  // Optional fields — appears in some datasets
  status?: string;
  softwareType?: string;
  policyCompliance?: string;
  clientServer?: string;

  // For flexibility & forward compatibility
  [key: string]: unknown;
}
export type EmployeeAssignmentRow = {
  id: string;
  deviceName: string;          // ชื่อเครื่อง เช่น "NB-201"
  userName: string;            // ชื่อผู้ใช้ (โชว์ชื่อพนักงานหรือ user ที่ติดตั้ง)
  licenseStatus?: "Active" | "Pending" | "Expired";
  licenseKey?: string | null;
  scannedLicenseKey?: string | null;
  workStation?: string | null; // ถ้ามีฟิลด์สถานีทำงาน
};

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
  expiryDate: string; // ISO date string
  assignedDate: string; //   เปลี่ยนจาก AssignedDate → camelCase
  softwareId?: string;
  softwareName?: string;
  status: LicenseStatus;
};

export type LicenseInstallationRow = {
  id: string;


  // User
  userName: string;              // เดิม
  userEmail?: string | null;     // ✅ เพิ่ม: สำหรับคอลัมน์ "Email"
  department?: string | null;    // ✅ เพิ่ม: สำหรับคอลัมน์ "Department"

  // Device/Location
  deviceName: string;            // เดิม (เดิมเคยใช้ "device")
  workStation?: string | null;   // เดิม


  assignedAt?: string | null;    // เดิม
  assignedBy?: string | null;    // เดิม
  expiresAt?: string | null;     // เดิม


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
  // Identity (ใช้เป็น key/render/operations)
  id: string; // unique id ของ assignment row (เช่น seatAssignmentId)
  licenseName: string; // license ตัวที่กำลังดูอยู่ (context)
  userName: string; // ชื่อที่แสดงในตาราง (display name)
  userEmail?: string | null; // เพื่อค้นหา/ฟิลเตอร์ได้สะดวก
  department?: string | null; // สำหรับฟิลเตอร์/บริบทในองค์กร
  workStation?: string | null; // ยังคงรองรับของเดิม (ถ้ายังเก็บตำแหน่ง/ไซต์)

  // License/Assignment Attributes
  assignmentStatus: "Active" | "Pending" | "Expired" | "Revoked";
  assignedAt?: string | null; // ISO datetime เมื่อ assign
  assignedBy?: string | null; // ผู้ที่ assign (email/display name)
  expiresAt?: string | null; // ถ้ามีวันหมดอายุ/term
  deviceId: string;

  // Keys / Evidence (ถ้าลิขสิทธิ์ชนิดต้องใช้ key)
  licenseKey?: string | null; // คีย์ที่ถูก assign ให้ user นี้ (ถ้ามี)
  scannedLicenseKey?: string | null; // key ที่สแกนพบจากเครื่อง (ใช้ reconcile)
};

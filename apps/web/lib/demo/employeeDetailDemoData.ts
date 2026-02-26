// src/lib/demo/employeeDetailDemoData.ts

import type { EmployeeAssignmentRow, HistoryEvent } from "types";

/**
 * ชุดข้อมูล Assignments แบบสาธิต
 * ใช้เป็น fallback เมื่อยังไม่มีข้อมูลจาก API
 */
export const demoAssignments: EmployeeAssignmentRow[] = [
  {
    id: "a-1",
    licenseName: "lic-001",

    userName: "alice",
    userEmail: "alice@example.com",
    department: "IT Department",
    workStation: "Bangkok-HQ-03F",

    assignmentStatus: "Active",
    assignedAt: "2025-11-01T09:30:00Z",
    assignedBy: "admin@example.com",
    expiresAt: "2026-11-01T00:00:00Z",

    deviceId: "NB-201",

    licenseKey: "AAAAA-BBBBB-CCCCC-11111",
    scannedLicenseKey: "AAAAA-BBBBB-CCCCC-11111",
  },
  {
    id: "a-2",
    licenseName: "lic-001",

    userName: "alice",
    userEmail: "alice@example.com",
    department: "IT Department",
    workStation: "Bangkok-HQ-03F",

    assignmentStatus: "Active",
    assignedAt: "2025-11-01T09:30:00Z",
    assignedBy: "admin@example.com",
    expiresAt: "2026-11-01T00:00:00Z",

    deviceId: "PC-304",

    licenseKey: "AAAAA-BBBBB-CCCCC-11111",
    scannedLicenseKey: "AAAAA-BBBBB-XXXXX-99999", // intentionally mismatched example
  },
  {
    id: "a-3",
    licenseName: "lic-001",

    userName: "alice",
    userEmail: "alice@example.com",
    department: "IT Department",
    workStation: "Bangkok-HQ-03F",

    assignmentStatus: "Pending",
    assignedAt: "2025-11-05T10:15:00Z",
    assignedBy: "it-ops@example.com",
    expiresAt: "2026-11-05T00:00:00Z",

    deviceId: "SRV-09",

    licenseKey: "AAAAA-BBBBB-CCCCC-11111",
    scannedLicenseKey: null, // not yet scanned
  },
];


/**
 * ชุดข้อมูล History แบบสาธิต
 * ใช้เป็น fallback เมื่อยังไม่มีข้อมูลจาก API
 */
export const demoHistory: HistoryEvent[] = [
  {
    id: "eh1",
    timestamp: new Date().toISOString(),
    actor: "system",
    action: "sync",
    detail: "Employee profile synced",
  },
  {
    id: "eh2",
    timestamp: new Date().toISOString(),
    actor: "admin",
    action: "update",
    detail: "Department changed to Engineering",
  },
];
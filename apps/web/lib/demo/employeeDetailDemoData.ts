// src/lib/demo/employeeDetailDemoData.ts

import type { EmployeeAssignmentRow, HistoryEvent } from "types";

/**
 * ชุดข้อมูล Assignments แบบสาธิต
 * ใช้เป็น fallback เมื่อยังไม่มีข้อมูลจาก API
 */
export const demoAssignments: EmployeeAssignmentRow[] = [
  {
    id: "a-1",
    deviceName: "NB-201",
    userName: "alice",
    licenseStatus: "Active",
  },
  {
    id: "a-2",
    deviceName: "PC-304",
    userName: "alice",
    licenseStatus: "Active",
  },
  {
    id: "a-3",
    deviceName: "SRV-09",
    userName: "alice",
    licenseStatus: "Active",
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
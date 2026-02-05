// src/lib/demo/exceptionDetailDemoData.ts
import type { ExceptionAssignmentRow } from "types/exception";
import type { HistoryEvent } from "types";

/**
 * Demo assignments (User-only) ให้ตรงกับ type ใหม่
 * - ใช้ employeeId/employeeName แทน target*
 * - ลบ device/group/tenant ออก
 */
export const demoExceptionAssignments: ExceptionAssignmentRow[] = [
  {
    id: "A-001",
    definitionId: "EXC-DEMO",
    employeeId: "EMP-001",
    employeeName: "Jirawee Phongchai",
    department: "สำนักเทคนิคโทรทัศน์",
    assignedBy: "Puttaraporn Jitpranee",
    assignedAt: "2026-01-20T09:00:00Z",
    expiresAt: "2026-03-31T23:59:59Z",
    status: "Active",
    notes: "For AI tooling during Q1 project",
  },
  {
    id: "A-002",
    definitionId: "EXC-DEMO",
    employeeId: "EMP-002",
    employeeName: "Puttaraporn Jitpranee",
    department: "Compliance",
    assignedBy: "Puttaraporn Jitpranee",
    assignedAt: "2026-01-15T10:30:00Z",
    expiresAt: null,
    status: "Active",
    notes: "Permanent exemption for compliance validation",
  },
  {
    id: "A-003",
    definitionId: "EXC-DEMO",
    employeeId: "EMP-003",
    employeeName: "Napat S.",
    department: "สำนักเทคนิคโทรทัศน์",
    assignedBy: "Jirawee Phongchai",
    assignedAt: "2025-12-28T08:20:00Z",
    expiresAt: "2026-01-25T00:00:00Z",
    status: "Revoked",
    notes: "Contract ended",
  },
  {
    id: "A-004",
    definitionId: "EXC-DEMO",
    employeeId: "EMP-004",
    employeeName: "Suthep K.",
    department: "Operations",
    assignedBy: "Jirawee Phongchai",
    assignedAt: "2025-12-10T07:45:00Z",
    expiresAt: null,
    status: "Revoked",
    notes: "Security policy updated",
  },
];

export const demoExceptionHistory: HistoryEvent[] = [
  {
    id: "H-001",
    detail: "Approved by SecOps",
    timestamp: "2026-01-20T09:05:00Z",
    actor: "SecOps",
    action: "approve",
  },
  {
    id: "H-002",
    detail: "Requested by jirawee.p",
    timestamp: "2026-01-19T17:12:00Z",
    actor: "jirawee.p",
    action: "request",
  },
];
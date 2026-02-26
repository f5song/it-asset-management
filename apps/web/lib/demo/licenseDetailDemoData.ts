
import type { LicenseInstallationRow, HistoryEvent } from "types";

export const demoInstallations: LicenseInstallationRow[] = [
  {
    id: "lic-ins-1",
    userName: "mike",
    userEmail: "mike@example.com",
    department: "IT Operations",
    deviceName: "NB-201",
    workStation: "Bangkok-HQ-03F",
    assignedAt: "2025-11-01T10:00:00Z",
    assignedBy: "admin@example.com",
    expiresAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "lic-ins-2",
    userName: "nina",
    userEmail: "nina@example.com",
    department: "Finance Department",
    deviceName: "PC-304",
    workStation: "Bangkok-HQ-04F",
    assignedAt: "2025-11-05T14:20:00Z",
    assignedBy: "it-ops@example.com",
    expiresAt: "2026-11-05T00:00:00Z",
  },
  {
    id: "lic-ins-3",
    userName: "system",
    userEmail: "system@local",
    department: "Data Center",
    deviceName: "SRV-09",
    workStation: "DataCenter-01",
    assignedAt: "2025-11-08T08:00:00Z",
    assignedBy: "system-auto",
    expiresAt: null, // ไม่มีวันหมดอายุ
  },
];



export const demoHistory: HistoryEvent[] = [
  {
    id: "lh1",
    timestamp: new Date().toISOString(),
    actor: "system",
    action: "sync",
    detail: "License sync finished",
  },
  {
    id: "lh2",
    timestamp: new Date().toISOString(),
    actor: "admin",
    action: "update",
    detail: "Adjusted license seats",
  },
];

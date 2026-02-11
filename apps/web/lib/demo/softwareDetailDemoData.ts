
import type { InstallationRow, HistoryEvent } from "types";

export const demoSoftwareInstallations: InstallationRow[] = [
  { id: "sw-ins-1", deviceName: "NB-204", userName: "alice" , department: "สำนักกิจการและสื่อสารองค์กร", version: "2.9.0.3", installDate: "2026-09-16", lastSeen: "2026-10-11", workStation: "almkt-athitay01.workgroup"},
];

export const demoHistory: HistoryEvent[] = [
  {
    id: "h1",
    timestamp: new Date().toISOString(),
    actor: "system",
    action: "sync",
    detail: "Synced software records",
  },
  {
    id: "h2",
    timestamp: new Date().toISOString(),
    actor: "admin",
    action: "edit",
    detail: "Updated software information",
  },
];

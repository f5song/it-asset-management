
import type { InstallationRow, HistoryEvent } from "types";

export const demoSoftwareInstallations: InstallationRow[] = [
  { id: "sw-ins-1", deviceName: "NB-204", userName: "alice" },
  { id: "sw-ins-2", deviceName: "PC-889", userName: "john" },
  { id: "sw-ins-3", deviceName: "PC-901", userName: "system" },
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

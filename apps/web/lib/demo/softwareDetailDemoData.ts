
import type { InstallationRow, HistoryEvent } from "types";

export const demoSoftwareInstallations: InstallationRow[] = [
  { id: "sw-ins-1", device: "NB-204", user: "alice" },
  { id: "sw-ins-2", device: "PC-889", user: "john" },
  { id: "sw-ins-3", device: "PC-901", user: "system" },
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

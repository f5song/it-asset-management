
import type { LicenseInstallationRow, HistoryEvent } from "types";

export const demoInstallations: LicenseInstallationRow[] = [
  { id: "lic-ins-1", deviceName: "NB-201", userName: "mike", licenseStatus: "Active" },
  { id: "lic-ins-2", deviceName: "PC-304", userName: "nina", licenseStatus: "Active" },
  { id: "lic-ins-3", deviceName: "SRV-09", userName: "system", licenseStatus: "Active" },
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

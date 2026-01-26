
// src/services/mock/installation.mock.ts

import { InstallationRow } from "../types";


export const MOCK_INSTALLATIONS_BY_SOFTWARE: InstallationRow[] = [
  { id: "1", device: "LAPTOP-TH-BKK-01", user: "Puttaraporn Jitpranee", date: "2025-01-01", version: "123" },
  { id: "2", device: "LAPTOP-TH-BKK-02", user: "Puttaraporn Jitpranee", date: "2025-01-02", version: "123" },
];

export async function getInstallationsBySoftware(id: string): Promise<InstallationRow[]> {
  return MOCK_INSTALLATIONS_BY_SOFTWARE;
}

export async function getInstallationFilters(id: string): Promise<{ users: string[]; devices: string[] }> {
  const users = Array.from(new Set(MOCK_INSTALLATIONS_BY_SOFTWARE.map((r) => r.user)));
  const devices = Array.from(new Set(MOCK_INSTALLATIONS_BY_SOFTWARE.map((r) => r.device)));
  return { users, devices };
}

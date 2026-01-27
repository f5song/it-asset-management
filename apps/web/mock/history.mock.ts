import { HistoryEvent } from "types";

export const MOCK_HISTORY: HistoryEvent[] = [
  { id: "h1", detail: "License renewed", actor: "Admin", timestamp: "2025-12-01", action: "assign" },
  { id: "h2", detail: "Policy updated", actor: "Security Team", timestamp: "2025-08-15", action: "assign" },
];

export async function getHistoryBySoftware(id: string): Promise<HistoryEvent[]> {
  return MOCK_HISTORY;
}

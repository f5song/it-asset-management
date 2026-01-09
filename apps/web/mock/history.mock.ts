
// src/services/mock/history.mock.ts
import type { HistoryEvent } from "@/types";

export const MOCK_HISTORY: HistoryEvent[] = [
  { id: "h1", title: "License renewed", actor: "Admin", date: "2025-12-01" },
  { id: "h2", title: "Policy updated", actor: "Security Team", date: "2025-08-15" },
];

export async function getHistoryBySoftware(id: string): Promise<HistoryEvent[]> {
  return MOCK_HISTORY;
}

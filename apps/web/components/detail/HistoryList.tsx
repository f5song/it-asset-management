"use client";
import type { HistoryEvent } from "@/types";

export function HistoryList({ history }: { history: HistoryEvent[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {history.length === 0 ? (
        <li className="text-sm text-slate-500">No history yet.</li>
      ) : (
        history.map((h) => (
          <li key={h.id} className="grid grid-cols-[16px_1fr] gap-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
            <div>
              <div className="text-sm font-semibold text-slate-900">{h.title}</div>
              <div className="text-xs text-slate-500">
                {h.actor} • {h.date}
              </div>
            </div>
          </li>
        ))
      )}
    </ul>
  );
}

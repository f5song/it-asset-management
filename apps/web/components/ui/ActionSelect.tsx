
// src/components/installation/ActionSelect.tsx
"use client";
import React from "react";
import { ToolbarAction } from "../../types/tab";

export function ActionSelect({ onAction }: { onAction: (action: ToolbarAction) => void }) {
  const id = React.useId();
  return (
    <>
      <label htmlFor={id} className="sr-only">
        Action
      </label>
      <select
        id={id}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        defaultValue=""
        onChange={(e) => {
          const act = e.target.value as ToolbarAction;
          if (act) onAction(act);
          e.currentTarget.selectedIndex = 0; // reset
        }}
      >
        <option value="">Action ▾</option>
        <option value="delete">Delete</option>
        <option value="reassign">Reassign</option>
        <option value="assign">Assign</option>
        <option value="add">Add</option>
      </select>
    </>
  );
}

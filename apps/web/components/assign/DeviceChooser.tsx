"use client";
import * as React from "react";
import type { DeviceItem } from "types/device";
import { show } from "lib/show";

export default function DeviceChooser({
  devices,
  selected,
  onToggle,
  title = "เลือกเครื่องที่จะลง",
}: {
  devices: DeviceItem[];
  selected: string[];                       // deviceIds
  onToggle: (deviceId: string, checked: boolean) => void;
  title?: string;
}) {
  return (
    <div className="mt-2">
      <div className="text-xs text-slate-500 mb-1">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {devices.map((d) => {
          const checked = selected.includes(d.id);
          return (
            <label key={d.id} className="flex items-center gap-2 text-sm border rounded px-2 py-1">
              <input
                type="checkbox"
                checked={checked}
                onChange={(ev) => onToggle(d.id, ev.target.checked)}
              />
              <span className="truncate">
                {show(d.name)} <span className="text-slate-500">({show(d.type)} · {show(d.os)})</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// src/services/devices.service.mock.ts
import type { DeviceItem } from "types/device"; // หรือ "types" ตามโปรเจกต์คุณ
import type { DeviceItemsQuery, DeviceItemsResponse } from "types/device";

// ---- Mock dataset ----------------------------------------------------------
const MOCK_DEVICES: DeviceItem[] = Array.from({ length: 57 }).map((_, i) => ({
  id: `D-${i + 1}`,
  name: `Device ${i + 1}`,
  type: i % 2 === 0 ? "Laptop" : "Desktop",
  assignedTo: i % 3 === 0 ? `User ${i}` : "",
  os: ["Windows", "macOS", "Linux"][i % 3],
  compliance: i % 2 === 0 ? "Compliant" : "Non-Compliant",
  lastScan: "2026-01-10",
}));

// ---- Utils -----------------------------------------------------------------
function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      });
    }
  });
}

const ci = (s?: string) => (s ?? "").toLowerCase();
const includesCI = (text: string, q: string) => ci(text).includes(ci(q));
const isAssigned = (d: DeviceItem) => !!(d.assignedTo && d.assignedTo.trim().length > 0);

// ---- Service API (no interface) -------------------------------------------

/** GET /devices/:id */
export async function getDeviceById(id: string | number, signal?: AbortSignal): Promise<DeviceItem | null> {
  await sleep(80, signal);
  return MOCK_DEVICES.find((d) => String(d.id) === String(id)) ?? null;
}

/** GET /devices (with filters/sort/pagination) — same shape as software.getItemsStock */
export async function getDevices(q: DeviceItemsQuery, signal?: AbortSignal): Promise<DeviceItemsResponse> {
  await sleep(150, signal);

  let filtered = [...MOCK_DEVICES];

  // 1) Search (name/id/assignedTo)
  const searchText = (q.searchText ?? "").trim();
  if (searchText) {
    filtered = filtered.filter(
      (d) => includesCI(d.name, searchText) || includesCI(d.id, searchText) || includesCI(d.assignedTo ?? "", searchText)
    );
  }

  // 2) Filters
  if (q.deviceGroupFilter) {
    const g = ci(q.deviceGroupFilter);
    filtered = filtered.filter((d) => (g === "assigned" ? isAssigned(d) : !isAssigned(d)));
  }

  if (q.deviceTypeFilter) {
    const t = ci(q.deviceTypeFilter);
    filtered = filtered.filter((d) => ci(d.type) === t);
  }

  if (q.osFilter) {
    const os = ci(q.osFilter) === "macos" ? "macos" : ci(q.osFilter);
    const norm = (x: string) => (ci(x) === "macos" ? "macos" : ci(x));
    filtered = filtered.filter((d) => norm(d.os) === os);
  }

  // 3) Sort
  if (q.sortBy) {
    const dir = q.sortOrder === "desc" ? -1 : 1;
    const key = q.sortBy as keyof DeviceItem;
    filtered.sort((a, b) => {
      const A = (a[key] as any) ?? "";
      const B = (b[key] as any) ?? "";
      return A > B ? dir : A < B ? -dir : 0;
    });
  }

  // 4) Pagination (page/limit)
  const total = filtered.length;
  const page = Math.max(1, Number(q.page ?? 1));
  const limit = Math.max(1, Number(q.limit ?? 10));
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

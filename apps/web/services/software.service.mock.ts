
// services/software.service.mock.ts
import { ItemsQuery, ItemsResponse } from "types";
import type { SoftwareItem } from "types/software";

const COMPLIANCE = ["Compliant", "Non-Compliant"] as const;
const STATUS = ["Active", "Expired", "Expiring"] as const;
const TYPE = ["Standard", "Special", "Exception"] as const;
const CLIENT_SERVER = ["Client", "Server"] as const;
const MODEL = ["Per-User", "Per-Device", "Perpetual", "Subscription"] as const;

const ALL: SoftwareItem[] = Array.from({ length: 57 }).map((_, i) => ({
  id: `soft-${i + 1}`,
  softwareName: `Tool ${i + 1}`,
  manufacturer: ["Microsoft", "Adobe", "JetBrains", "Autodesk"][i % 4],
  version: `v${Math.floor(i / 10)}.${i % 10}`,
  category: ["IDE", "Security", "Design", "CAD"][i % 4],
  policyCompliance: COMPLIANCE[i % COMPLIANCE.length],
  expiryDate: "2026-12-31",
  status: STATUS[i % STATUS.length],
  softwareType: TYPE[i % TYPE.length],
  licenseModel: MODEL[i % MODEL.length],
  clientServer: CLIENT_SERVER[i % CLIENT_SERVER.length],
}));

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

export async function getItemById(id: string): Promise<SoftwareItem | null> {
  await sleep(80);
  return ALL.find(x => x.id === id) ?? null;
}

export async function getItemsStock(q: ItemsQuery): Promise<ItemsResponse> {
  await sleep(150);

  let filtered = [...ALL];

  const searchText = (q.searchText ?? "").toLowerCase();
  if (searchText) {
    filtered = filtered.filter(
      (r) =>
        r.softwareName.toLowerCase().includes(searchText) ||
        r.manufacturer.toLowerCase().includes(searchText)
    );
  }
  if (q.statusFilter) filtered = filtered.filter((r) => r.status === q.statusFilter);
  if (q.typeFilter) filtered = filtered.filter((r) => r.softwareType === q.typeFilter);
  if (q.manufacturerFilter)
    filtered = filtered.filter((r) => r.manufacturer === q.manufacturerFilter);

  if (q.sortBy) {
    const dir = q.sortOrder === "desc" ? -1 : 1;
    const key = q.sortBy as keyof SoftwareItem;
    filtered.sort((a, b) => {
      const A = a[key] as any;
      const B = b[key] as any;
      return A > B ? dir : A < B ? -dir : 0;
    });
  }

  const total = filtered.length;
  const page = q.page;
  const limit = q.limit;
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

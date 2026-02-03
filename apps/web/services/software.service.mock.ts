// services/software.service.mock.ts
import type {
  SoftwareItem,
  SoftwareListQuery,
  SoftwareListResponse,
} from "types/software";

import { LicenseModel } from "types/license"; // ถ้า licenseModel เป็น enum
// (ถ้าเป็น string union อยู่แล้ว ก็ไม่ต้อง import enum)

const COMPLIANCE = ["Compliant", "Non-Compliant"] as const;
const STATUS = ["Active", "Expired", "Expiring"] as const;
const TYPE = ["Standard", "Special", "Exception"] as const;
const CLIENT_SERVER = ["Client", "Server"] as const;
// แนะนำให้ใช้ enum เพื่อชนิดแน่น:
const MODEL = [
  "Per-User",
  "Per-Device",
  "Perpetual",
  "Subscription",
] as const satisfies readonly LicenseModel[];
// ถ้าไม่ได้ใช้ enum: ใช้ string union ของ SoftwareItem["licenseModel"] ก็ได้

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

export async function getItemById(id: string, signal?: AbortSignal): Promise<SoftwareItem | null> {
  await sleep(80, signal);
  return ALL.find(x => x.id === id) ?? null;
}

export async function getItemsStock(q: SoftwareListQuery, signal?: AbortSignal): Promise<SoftwareListResponse> {
  await sleep(150, signal);

  let filtered = [...ALL];

  const search = (q.search ?? "").toLowerCase();
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.softwareName.toLowerCase().includes(search) ||
        r.manufacturer.toLowerCase().includes(search)
    );
  }
  if (q.status) filtered = filtered.filter((r) => r.status === q.status);
  if (q.type) filtered = filtered.filter((r) => r.softwareType === q.type);
  if (q.manufacturer)
    filtered = filtered.filter((r) => r.manufacturer === q.manufacturer);

  if (q.sortBy) {
    const dir = q.sortOrder === "desc" ? -1 : 1;
    const key = q.sortBy as keyof SoftwareItem;
    filtered.sort((a, b) => {
      const A = a[key] as any;
      const B = b[key] as any;
      return A > B ? dir : A < B ? -dir : 0;
    });
  }

  const totalCount = filtered.length;
  const page = Math.max(1, Number(q.page ?? 1));
  const pageSize = Math.max(1, Number(q.pageSize ?? 10));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    items,
    totalCount,
    page,
    pageSize,
    totalPages,
    hasNext,
    hasPrev,
  };
}
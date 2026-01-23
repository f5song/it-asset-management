
// src/services/licenses.service.mock.ts
// แนะนำปรับ path import ให้เป็น alias ของโปรเจกต์คุณ เช่น: "@/types"
import type { LicenseItem } from "types";

export type LicensesQuery = {
  page: number; // 1-based
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;        // "" = all
  licenseModel?: string;   // "" = all
  manufacturer?: string;  // "" = all
  search?: string;        // "" = all
};

export type PagedResponse<T> = { items: T[]; total: number };

// -----------------------------
// Mock data dictionaries
// -----------------------------
const manufacturers = ["Microsoft", "Adobe", "Autodesk", "JetBrains", "Atlassian"] as const;
const licenseModel = ["Per-User", "Perpetual", "Subscription", "Per-Device"] as const;
const statuses = ["Active", "Expiring", "Expired"] as const;
const complianceOptions = ["Compliant", "Non-compliant", "Warning"] as const;

// -----------------------------
// Helpers
// -----------------------------
const normalize = (s?: string) => (s ?? "").trim().toLowerCase();

const SORT_KEYS = [
  "softwareName",
  "manufacturer",
  "licenseModel",
  "total",
  "inUse",
  "available",
  "expiryDate",
  "status",
  "compliance",
] as const;
type SortKey = (typeof SORT_KEYS)[number];

function isSortKey(k?: string): k is SortKey {
  return !!k && (SORT_KEYS as readonly string[]).includes(k);
}

function compare(key: SortKey, a: LicenseItem, b: LicenseItem) {
  const va = (a as any)[key];
  const vb = (b as any)[key];

  // date
  if (key === "expiryDate") {
    const ta = va ? new Date(va).getTime() : Number.NaN;
    const tb = vb ? new Date(vb).getTime() : Number.NaN;
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    return ta - tb;
  }

  // number
  if (typeof va === "number" && typeof vb === "number") return va - vb;

  // string (เปิด numeric)
  return String(va ?? "").localeCompare(String(vb ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

// -----------------------------
// Mock dataset
// -----------------------------
const MOCK_LICENSES: LicenseItem[] = Array.from({ length: 57 }).map((_, i) => {
  const total = 100 + (i % 7) * 5;
  const inUse = 40 + (i % 5) * 7;
  const available = total - inUse;

  return {
    id: `LIC-${i + 1}`,
    softwareName: `Software ${i + 1}`,
    manufacturer: manufacturers[i % manufacturers.length],
    licenseModel: licenseModel[i % licenseModel.length],
    total,
    inUse,
    available,
    expiryDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-28`,
    status: statuses[i % statuses.length],
    compliance: complianceOptions[i % complianceOptions.length],
  } as LicenseItem;
});

// -----------------------------
// Public APIs (mock)
// -----------------------------
export async function getLicenseById(id: string): Promise<LicenseItem | null> {
  await new Promise((r) => setTimeout(r, 120));
  return MOCK_LICENSES.find((x) => String(x.id) === String(id)) ?? null;
}

export async function getLicenses(q: LicensesQuery): Promise<PagedResponse<LicenseItem>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const kw = normalize(q.search);
      let data = [...MOCK_LICENSES];

      // filters (ค่าว่าง "" = ไม่กรอง)
      if (q.status) data = data.filter((x) => x.status === q.status);
      if (q.licenseModel) data = data.filter((x) => x.licenseModel === q.licenseModel);
      if (q.manufacturer)
        data = data.filter((x) => normalize(x.manufacturer) === normalize(q.manufacturer));
      if (kw)
        data = data.filter(
          (x) =>
            normalize(x.softwareName).includes(kw) ||
            normalize(x.manufacturer).includes(kw) ||
            normalize(x.licenseModel).includes(kw)
        );

      // sort
      const dir = q.sortOrder === "desc" ? -1 : 1;
      const key = isSortKey(q.sortBy) ? q.sortBy : undefined;
      if (key) data.sort((a, b) => compare(key, a, b) * dir);

      // paginate (1-based)
      const start = (q.page - 1) * q.pageSize;
      const items = data.slice(start, start + q.pageSize);

      resolve({ items, total: data.length });
    }, 400);
  });
}

/** -----------------------------
 *  ✅ Added for assignment service integration
 *  ----------------------------- */
export async function getAvailableLicenses(): Promise<LicenseItem[]> {
  await new Promise((r) => setTimeout(r, 100));
  return MOCK_LICENSES.filter((x) => (x.available ?? (x.total - x.inUse)) > 0);
}

export async function consumeSeat(licenseId: string, n = 1): Promise<void> {
  const idx = MOCK_LICENSES.findIndex((l) => l.id === licenseId);
  if (idx < 0) throw new Error("License not found");
  const lic = { ...MOCK_LICENSES[idx] };
  const available = (lic.available ?? (lic.total - lic.inUse));
  if (available < n) throw new Error("No seats left");

  lic.inUse = (lic.inUse ?? 0) + n;
  lic.available = Math.max(0, lic.total - lic.inUse);
  MOCK_LICENSES[idx] = lic;
}

export async function releaseSeat(licenseId: string, n = 1): Promise<void> {
  const idx = MOCK_LICENSES.findIndex((l) => l.id === licenseId);
  if (idx < 0) return;
  const lic = { ...MOCK_LICENSES[idx] };

  lic.inUse = Math.max(0, (lic.inUse ?? 0) - n);
  lic.available = Math.max(0, lic.total - lic.inUse);
  MOCK_LICENSES[idx] = lic;
}

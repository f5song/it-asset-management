// src/services/licenses.service.mock.ts
// แนะนำปรับ path import ให้เป็น alias ของโปรเจกต์คุณ เช่น: "@/types"
import type { LicenseFilters, LicenseItem } from "types";

// -------------------------------------------------
// Types
// -------------------------------------------------
export type LicensesQuery = {
  page: number; // 1-based
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;        // "" = all
  licenseModel?: string;  // "" = all
  manufacturer?: string;  // "" = all
  search?: string;        // "" = all
};

export type PagedResponse<T> = { items: T[]; total: number };

/** ✅ ชนิดข้อมูลสรุป (ไม่ผูกกับ paging) */
export type LicenseSummary = {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  warning: number;
  unknown: number;
  seatsTotal: number;
  seatsUsed: number;
  seatsAvailable: number;
  byModel: Record<string, number>;
  byManufacturer: Record<string, number>;
};

// -------------------------------------------------
// Mock data dictionaries
// -------------------------------------------------
const manufacturers = ["Microsoft", "Adobe", "Autodesk", "JetBrains", "Atlassian"] as const;
const licenseModel = ["Per-User", "Perpetual", "Subscription", "Per-Device"] as const;
const statuses = ["Active", "Expiring", "Expired"] as const;
const complianceOptions = ["Compliant", "Non-compliant", "Warning"] as const;

// -------------------------------------------------
// Helpers
// -------------------------------------------------
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
    const ta = va ? new Date(`${va}T23:59:59Z`).getTime() : Number.NaN;
    const tb = vb ? new Date(`${vb}T23:59:59Z`).getTime() : Number.NaN;
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

/** แปลงวันที่แบบปลอดภัย */
function safeTime(d?: string | null): number {
  if (!d) return Number.NaN;
  const t = new Date(`${d}T23:59:59Z`).getTime();
  return Number.isNaN(t) ? Number.NaN : t;
}

// -------------------------------------------------
// Mock dataset
// -------------------------------------------------
const MOCK_LICENSES: LicenseItem[] = Array.from({ length: 57 }).map((_, i) => {
  const total = 100 + (i % 7) * 5;
  const inUse = 40 + (i % 5) * 7;
  const available = total - inUse;

  return {
    id: `LIC-${i + 1}`,
    softwareName: `Software ${i + 1}`,
    manufacturer: manufacturers[i % manufacturers.length],
    licenseModel: licenseModel[i % licenseModel.length] as any, // ตาม type กลางคุณเป็น enum/string ก็ได้
    total,
    inUse,
    available,
    expiryDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-28`,
    status: statuses[i % statuses.length] as any,
    compliance: complianceOptions[i % complianceOptions.length] as any,
  } as LicenseItem;
});

// -------------------------------------------------
// Public APIs (mock)
// -------------------------------------------------
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
      if (q.status)        data = data.filter((x) => normalize(x.status)       === normalize(q.status));
      if (q.licenseModel)  data = data.filter((x) => normalize(x.licenseModel) === normalize(q.licenseModel));
      if (q.manufacturer)  data = data.filter((x) => normalize(x.manufacturer) === normalize(q.manufacturer));
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
  return MOCK_LICENSES.filter((x) => (x.available ?? x.total - x.inUse) > 0);
}

export async function consumeSeat(licenseId: string, n = 1): Promise<void> {
  const idx = MOCK_LICENSES.findIndex((l) => l.id === licenseId);
  if (idx < 0) throw new Error("License not found");
  const lic = { ...MOCK_LICENSES[idx] };
  const available = lic.available ?? lic.total - lic.inUse;
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

/** -------------------------------------------------
 *  ✅ SUMMARY API (ไม่ผูกกับ paging) + รองรับ filters + AbortSignal
 *  ------------------------------------------------- */
export async function getLicenseSummary(
  filters?: {
    status?: string;
    licenseModel?: string;
    manufacturer?: string;
    search?: string;
  },
  signal?: AbortSignal
): Promise<LicenseSummary> {
  // รองรับ cancel ได้ด้วย signal (consistent pattern)
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 150);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      });
    }
  });

  // 1) clone + filter
  let data = [...MOCK_LICENSES];

  if (filters?.status)        data = data.filter((x) => normalize(x.status)       === normalize(filters.status));
  if (filters?.licenseModel)  data = data.filter((x) => normalize(x.licenseModel) === normalize(filters.licenseModel));
  if (filters?.manufacturer)  data = data.filter((x) => normalize(x.manufacturer) === normalize(filters.manufacturer));
  if (filters?.search) {
    const kw = normalize(filters.search);
    if (kw) {
      data = data.filter(
        (x) =>
          normalize(x.softwareName).includes(kw) ||
          normalize(x.manufacturer).includes(kw) ||
          normalize(x.licenseModel).includes(kw) ||
          normalize(x.status).includes(kw),
      );
    }
  }

  // 2) init
  const summary: LicenseSummary = {
    total: data.length,
    active: 0,
    inactive: 0,
    expired: 0,
    warning: 0,
    unknown: 0,
    seatsTotal: 0,
    seatsUsed: 0,
    seatsAvailable: 0,
    byModel: {},
    byManufacturer: {},
  };

  // 3) aggregate
  const nowT = Date.now();
  const soonMs = 30 * 24 * 60 * 60 * 1000; // ภายใน 30 วัน ถือว่า warning

  for (const it of data) {
    // seats
    summary.seatsTotal += it.total ?? 0;
    summary.seatsUsed += it.inUse ?? 0;

    // statuses
    if (it.status === "Active")   summary.active  += 1;
    else if (it.status === "Expired")  summary.expired += 1;
    else if (it.status === "Expiring") summary.warning += 1;

    // inactive: Active แต่ไม่ถูกใช้
    if (it.status === "Active" && (it.inUse ?? 0) === 0) {
      summary.inactive += 1;
    }

    // warning เพิ่มเติม: ใกล้หมดอายุ ≤ 30 วัน หรือ compliance === "Warning"
    const expT = safeTime(it.expiryDate);
    if (!Number.isNaN(expT)) {
      if (expT >= nowT && (expT - nowT) <= soonMs) summary.warning += 1;
    } else {
      summary.unknown += 1; // expiryDate แปลงไม่ได้
    }

    if ((it as any).compliance === "Warning") {
      summary.warning += 1;
    }

    // buckets
    summary.byModel[it.licenseModel] = (summary.byModel[it.licenseModel] ?? 0) + 1;
    summary.byManufacturer[it.manufacturer] = (summary.byManufacturer[it.manufacturer] ?? 0) + 1;
  }

  summary.seatsAvailable = Math.max(0, summary.seatsTotal - summary.seatsUsed);
  return summary;
}
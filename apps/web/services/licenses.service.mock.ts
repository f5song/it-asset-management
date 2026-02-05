// src/services/licenses.service.mock.ts

// ✅ ใช้ alias path ของโปรเจกต์ (ปรับให้ตรงกับโปรเจกต์คุณ เช่น "@/types")
import type {
  LicenseItem,
  LicenseFilters,
  LicenseListQuery,
  LicenseListResponse,
  LicenseStatus,
  LicenseModel,
  LicenseSummary,
} from "@/types/license";
import type { SortOrder } from "@/types/common";

// -------------------------------------------------
// Types ที่ใช้ภายในไฟล์นี้
// -------------------------------------------------

/** สรุป (ไม่ผูกกับ paging) */

// -------------------------------------------------
// Mock dictionaries
// -------------------------------------------------
const manufacturers = ["Microsoft", "Adobe", "Autodesk", "JetBrains", "Atlassian"] as const;
const licenseModels: LicenseModel[] = ["Per-User", "Perpetual", "Subscription", "Per-Device"];
const statuses: LicenseStatus[] = ["Active", "Expired"]; // หมายเหตุ: mock เดิมมี "Expiring" ด้วย ถ้าต้องการให้เพิ่มที่ type

// สำหรับ compliance: อ้างจากฝั่ง software ถ้าคุณมี enum กลาง ให้ import มาแทน
const complianceOptions = ["Compliant", "Non-Compliant", "Warning"] as const;

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

  // string
  return String(va ?? "").localeCompare(String(vb ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function safeTime(d?: string | null): number {
  if (!d) return Number.NaN;
  const t = new Date(`${d}T23:59:59Z`).getTime();
  return Number.isNaN(t) ? Number.NaN : t;
}

// -------------------------------------------------
// Mock dataset ให้สอดคล้องกับ LicenseItem ของคุณ
// -------------------------------------------------
const MOCK_LICENSES: LicenseItem[] = Array.from({ length: 57 }).map((_, i) => {
  const total = 100 + (i % 7) * 5;
  const inUse = 40 + (i % 5) * 7;
  const available = Math.max(0, total - inUse);

  return {
    id: `LIC-${i + 1}`,
    softwareName: `Software ${i + 1}`,
    manufacturer: manufacturers[i % manufacturers.length],
    licenseModel: licenseModels[i % licenseModels.length],
    // ฟิลด์อื่น ๆ ตาม LicenseItem ของคุณ:
    // (ถ้า LicenseItem ในโปรเจกต์คุณต้องการ field เพิ่ม ให้เติม mock ให้ครบ)
    sku: `SKU-${i + 1}`,
    edition: undefined,
    version: `v${(i % 5) + 1}.0`,
    consumptionUnit: "perUser",
    term: "subscription",

    total,
    inUse,
    available,

    expiryDate: `2026-${String((i % 12) + 1).padStart(2, "0")}-28`,
    status: (i % 3 === 0 ? "Expired" : "Active") as LicenseStatus,

    compliance: (i % 4 === 0 ? "Warning" : "Compliant") as any,

    // metadata
    createdAt: `2025-01-${String((i % 28) + 1).padStart(2, "0")}T12:00:00Z`,
    updatedAt: `2025-12-${String((i % 28) + 1).padStart(2, "0")}T12:00:00Z`,

    cost: 10000 + i * 137,
    maintenanceCost: 1000 + (i % 10) * 37,
    notes: "",
    licenseKey: `XXXX-XXXX-XXXX-${String(i + 1).padStart(4, "0")}`,
  } as LicenseItem;
});

// -------------------------------------------------
// Public APIs (mock)
// -------------------------------------------------
export async function getLicenseById(id: string): Promise<LicenseItem | null> {
  await new Promise((r) => setTimeout(r, 120));
  return MOCK_LICENSES.find((x) => String(x.id) === String(id)) ?? null;
}

/** -------------------------------------------------
 *  PAGED LIST (ใช้กับตาราง) — ใช้ type กลางจากไฟล์ types
 *  - รับ: LicenseListQuery
 *  - คืน: LicenseListResponse (OffsetPage<LicenseItem>)
 * ------------------------------------------------- */
export async function getLicenses(q: LicenseListQuery): Promise<LicenseListResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const kw = normalize(q.search);
      let data = [...MOCK_LICENSES];

      // filters
      if (q.status)        data = data.filter((x) => normalize(x.status)       === normalize(q.status));
      if (q.licenseModel)  data = data.filter((x) => normalize(x.licenseModel) === normalize(q.licenseModel));
      if (q.manufacturer)  data = data.filter((x) => normalize(x.manufacturer) === normalize(q.manufacturer));

      if (kw) {
        data = data.filter(
          (x) =>
            normalize(x.softwareName).includes(kw) ||
            normalize(x.manufacturer).includes(kw) ||
            normalize(x.licenseModel).includes(kw)
        );
      }

      // sort
      const dir = (q.sortOrder as SortOrder) === "desc" ? -1 : 1;
      const key = isSortKey(q.sortBy) ? q.sortBy : undefined;
      if (key) data.sort((a, b) => compare(key, a, b) * dir);

      // paginate (1-based)
      const start = (q.page - 1) * q.pageSize;
      const items = data.slice(start, start + q.pageSize);

      // ✅ รูปแบบตอบกลับเป็น OffsetPage<LicenseItem>
      const totalCount = data.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / q.pageSize));
      const page = q.page;
      const pageSize = q.pageSize;

      resolve({
        items,
        totalCount,
        page,
        pageSize,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        totalPages,
      });
    }, 400);
  });
}

/** -------------------------------------------------
 *  Assignment helpers
 * ------------------------------------------------- */
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
 *  SUMMARY API — ใช้ LicenseFilters (pick) จากไฟล์ type
 * ------------------------------------------------- */
export async function getLicenseSummary(
  filters?: Pick<LicenseFilters, "status" | "licenseModel" | "manufacturer" | "search">,
  signal?: AbortSignal
): Promise<LicenseSummary> {
  // รองรับ cancel
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, 150);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      });
    }
  });

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
          normalize(x.status).includes(kw)
      );
    }
  }

  // summary aggregation ----------------------------
  const summary: LicenseSummary = {
    total: data.length,
    active: 0,
    inactive: 0,
    expired: 0,
    warning: 0,
    available: 0,
    unknown: 0,
    seatsTotal: 0,
    seatsUsed: 0,
    seatsAvailable: 0,
    byModel: {},
    byManufacturer: {},
  };

  const nowT = Date.now();
  const soonMs = 30 * 24 * 60 * 60 * 1000; // 30 วัน

  for (const it of data) {
    summary.seatsTotal += it.total ?? 0;
    summary.seatsUsed += it.inUse ?? 0;

    if (it.status === "Active") summary.active += 1;
    else if (it.status === "Expired") summary.expired += 1;
    // หมายเหตุ: ถ้าคุณอยากรองรับ "Expiring" ใน LicenseStatus ให้เพิ่มใน type แล้วนับที่นี่ด้วย

    if (it.status === "Active" && (it.inUse ?? 0) === 0) {
      summary.inactive += 1;
    }

    const expT = safeTime(it.expiryDate);
    if (!Number.isNaN(expT)) {
      if (expT >= nowT && expT - nowT <= soonMs) summary.warning += 1;
    } else {
      summary.unknown += 1;
    }

    if ((it as any).compliance === "Warning") summary.warning += 1;

    summary.byModel[it.licenseModel] = (summary.byModel[it.licenseModel] ?? 0) + 1;
    summary.byManufacturer[it.manufacturer] = (summary.byManufacturer[it.manufacturer] ?? 0) + 1;
  }

  summary.seatsAvailable = Math.max(0, summary.seatsTotal - summary.seatsUsed);
  return summary;
}
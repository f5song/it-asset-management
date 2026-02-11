// src/services/software.service.mock.ts
import type {
  SoftwareItem,
  SoftwareListQuery,
  SoftwareListResponse,
  SoftwareReportSummary,
} from "types/software";

import { LicenseModel } from "types/license"; // ถ้าเป็น enum; ถ้าเป็น union string ก็ใช้ได้เหมือนกัน

// ──────────────────────────────────────────────────────────────────────────────
// Mock datasets
// ──────────────────────────────────────────────────────────────────────────────

const COMPLIANCE = ["Compliant", "Non-Compliant"] as const;
const TYPE = ["Standard", "Special"] as const;
const CLIENT_SERVER = ["Client", "Server"] as const;

// ถ้า LicenseModel เป็น enum ให้คง satisfies ไว้ เพื่อ type safety
const MODEL = [
  "Per-User",
  "Per-Device",
  "Perpetual",
  "Subscription",
] as const satisfies readonly LicenseModel[];

// ชุดหลัก "ALL" (คงไว้ตามเดิม)
const ALL: SoftwareItem[] = Array.from({ length: 57 }).map((_, i) => ({
  id: `soft-${i + 1}`,
  softwareName: `Adobe Creative Cloud for Teams ${i + 1}`,
  manufacturer: ["Microsoft", "Adobe", "JetBrains", "Autodesk"][i % 4],
  version: `v${Math.floor(i / 10)}.${i % 10}`,
  category: ["IDE", "Security", "Design", "CAD"][i % 4],
  policyCompliance: COMPLIANCE[i % COMPLIANCE.length],
  expiryDate: "2026-12-31",
  softwareType: TYPE[i % TYPE.length],
  licenseModel: MODEL[i % MODEL.length],
  clientServer: CLIENT_SERVER[i % CLIENT_SERVER.length],

  // mock KPI เพิ่มเติมเล็กน้อย (optional)
  seatsPurchased: 10 + (i % 25),
  seatsUsed: 8 + (i % 23),
  costPerSeat: 7 + (i % 11),
}));

// ⭐ เพิ่ม alias เพื่อไม่ให้โค้ดเก่าที่เรียกชื่อ MOCK_SOFTWARES พัง
const MOCK_SOFTWARES = ALL;

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      const onAbort = () => {
        clearTimeout(t);
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      };
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

const ci = (s?: string) => (s ?? "").toLowerCase();
const includesCI = (a: string, b: string) => ci(a).includes(ci(b));
const toISO = (d: Date) => d.toISOString().slice(0, 10);
function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

// ──────────────────────────────────────────────────────────────────────────────
// APIs (คงของเดิม + เพิ่ม/แก้ฟังก์ชันรายงาน)
// ──────────────────────────────────────────────────────────────────────────────

/** GET /softwares/:id (คงของเดิม) */
export async function getItemById(
  id: string,
  signal?: AbortSignal,
): Promise<SoftwareItem | null> {
  await sleep(80, signal);
  return ALL.find((x) => x.id === id) ?? null;
}

/** GET /softwares/stock (คงของเดิม) */
export async function getItemsStock(
  q: SoftwareListQuery,
  signal?: AbortSignal,
): Promise<SoftwareListResponse> {
  await sleep(150, signal);

  let filtered = [...ALL];

  // search
  const search = (q.search ?? "").toLowerCase();
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.softwareName.toLowerCase().includes(search) ||
        r.manufacturer.toLowerCase().includes(search),
    );
  }

  // filters (แบบเบา)
  if (q.type) filtered = filtered.filter((r) => r.softwareType === q.type);
  if (q.manufacturer)
    filtered = filtered.filter((r) => r.manufacturer === q.manufacturer);

  // sort
  if (q.sortBy) {
    const dir = q.sortOrder === "desc" ? -1 : 1;
    const key = q.sortBy as keyof SoftwareItem;
    filtered.sort((a, b) => {
      const A = a[key] as any;
      const B = b[key] as any;
      if (A == null && B == null) return 0;
      if (A == null) return -1 * dir;
      if (B == null) return 1 * dir;
      if (typeof A === "number" && typeof B === "number") return (A - B) * dir;
      return String(A).localeCompare(String(B), undefined, {
        numeric: true,
        sensitivity: "base",
      }) * dir;
    });
  }

  // pagination
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
    totalPages,  // ถ้า OffsetPage ของคุณไม่มี field นี้ สามารถลบได้
    hasNext,
    hasPrev,
  } as SoftwareListResponse as any;
}

/** GET /softwares (with filters/sort/pagination) — ใช้กับหน้า Report */
export async function listSoftwares(
  q: SoftwareListQuery,
  signal?: AbortSignal,
): Promise<SoftwareListResponse> {
  await sleep(120, signal);

  let data = [...MOCK_SOFTWARES];

  // ----- Search -----
  const search = (q.search ?? "").trim();
  if (search) {
    data = data.filter(
      (s) =>
        includesCI(s.id, search) ||
        includesCI(s.softwareName, search) ||
        includesCI(s.manufacturer, search) ||
        includesCI(s.version ?? "", search) ||
        includesCI(s.category ?? "", search) ||
        includesCI(s.licenseModel ?? "", search),
    );
  }

  // ----- Filters -----
  if (q.manufacturer) {
    const m = ci(q.manufacturer);
    data = data.filter((s) => ci(s.manufacturer) === m);
  }
  if (Array.isArray(q.manufacturers) && q.manufacturers.length > 0) {
    const set = new Set(q.manufacturers.map(ci));
    data = data.filter((s) => set.has(ci(s.manufacturer)));
  }
  if (q.type) {
    data = data.filter((s) => s.softwareType === q.type);
  }
  if (q.compliance) {
    data = data.filter((s) => s.policyCompliance === q.compliance);
  }
  if (q.clientServer) {
    data = data.filter((s) => s.clientServer === q.clientServer);
  }
  if (q.licenseModel) {
    data = data.filter((s) => ci(s.licenseModel as any) === ci(q.licenseModel as any));
  }
  if (q.expiryFrom) {
    data = data.filter((s) => !s.expiryDate || s.expiryDate >= q.expiryFrom!);
  }
  if (q.expiryTo) {
    data = data.filter((s) => !s.expiryDate || s.expiryDate <= q.expiryTo!);
  }

  // ----- Sort -----
  const dir = q.sortOrder === "desc" ? -1 : 1;
  if (q.sortBy) {
    const sortBy = q.sortBy;
    data.sort((a: any, b: any) => {
      const A = a[sortBy];
      const B = b[sortBy];
      if (A == null && B == null) return 0;
      if (A == null) return -1 * dir;
      if (B == null) return 1 * dir;

      if (typeof A === "number" && typeof B === "number") return (A - B) * dir;

      // ISO date และ string อื่น ๆ
      return String(A).localeCompare(String(B), undefined, {
        numeric: true,
        sensitivity: "base",
      }) * dir;
    });
  } else {
    // default: expiryDate ASC (null ไปท้าย)
    data.sort((a, b) => {
      const A = a.expiryDate ?? "9999-12-31";
      const B = b.expiryDate ?? "9999-12-31";
      return A.localeCompare(B);
    });
  }

  // ----- Pagination (1-based) -----
  const page = Math.max(1, Number((q as any).page ?? 1));
  const pageSize = Math.max(1, Number((q as any).pageSize ?? 10));
  const start = (page - 1) * pageSize;

  const totalCount = data.length;
  const items = data.slice(start, start + pageSize);

  return {
    items,
    totalCount,
    page,
    pageSize,
    hasPrev: page > 1,
    hasNext: start + items.length < totalCount,
  };
}

/** GET /reports/software/summary — KPI รวมของรายงาน */
export async function getSoftwareReportSummary(
  q: SoftwareListQuery,
  signal?: AbortSignal,
): Promise<SoftwareReportSummary> {
  await sleep(100, signal);

  // ดึงทั้งหมดตามกรอง (pageSize ใหญ่เพื่อความง่าย)
  const res = await listSoftwares({ ...q, page: 1, pageSize: 9999 }, signal);
  const items = res.items ?? [];

  const totalSoftwares = items.length;
  const totalManufacturers = new Set(items.map((s) => s.manufacturer)).size;

  const totalStandard = items.filter((s) => s.softwareType === "Standard").length;
  const totalSpecial = items.filter((s) => s.softwareType === "Special").length;

  const totalClient = items.filter((s) => s.clientServer === "Client").length;
  const totalServer = items.filter((s) => s.clientServer === "Server").length;

  const nonCompliantCount = items.filter((s) => s.policyCompliance === "Non-Compliant").length;

  const now = new Date().toISOString().slice(0, 10);
  const in30 = toISO(addDays(new Date(), 30));
  const expiringIn30Days = items.filter(
    (s) => s.expiryDate && s.expiryDate >= now && s.expiryDate <= in30,
  ).length;

  const totalCostEstimated = items.reduce((n, s) => {
    if (typeof s.costPerSeat !== "number" || typeof s.seatsPurchased !== "number") return n;
    return n + s.costPerSeat * s.seatsPurchased;
  }, 0);

  return {
    totalSoftwares,
    totalManufacturers,
    totalStandard,
    totalSpecial,
    totalClient,
    totalServer,
    nonCompliantCount,
    expiringIn30Days,
    totalCostEstimated: Math.round(totalCostEstimated),
  };
}
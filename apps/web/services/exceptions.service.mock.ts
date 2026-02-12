// src/services/exceptions.service.mock.ts
// Mock service สำหรับรายการคำขอ (Requests)

import { RequestItem, RequestRisk } from "@/types/exception";

/* ─────────────────────────────────────────────────────────────────────────────
 * Utilities
 * ────────────────────────────────────────────────────────────────────────────*/
const ci = (s?: string) => (s ?? "").toLowerCase();
const includesCI = (text: string, q: string) => ci(text).includes(ci(q));

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

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Filter options (ตามสเปคที่ให้มา)
 * ────────────────────────────────────────────────────────────────────────────*/

export const FILTER_OPTIONS = {
  sites: [
    "บริษัท บีอีซี แอสเซท จำกัด",
    "บริษัท บีอีซี-มัลติมีเดีย จำกัด",
    "บจก. บีอีซี ไอที โซลูชั่น",
    "บจก. บีอีซีไอ คอร์ปอเรชั่น",
    "บริษัท บางกอกเอ็นเตอร์เทนเม้นต์ จำกัด",
    "บริษัท บีอีซี บรอดคาสติ้ง เซ็นเตอร์ จำกัด",
    "บริษัท สำนักข่าว บีอีซี จำกัด",
    "บริษัท บีอีซี เวิลด์ จำกัด (มหาชน)",
  ] as const,
  risks: ["Low", "Medium", "High"] as const,
  exceptions: ["AD 90 : Password Policy", "LINE", "USB", "Generative AI"] as const,
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Mock data generators
 * ────────────────────────────────────────────────────────────────────────────*/

function makeTitle(i: number) {
  const apps = ["AD 90 : Password Policy", "LINE", "USB", "Generative AI"];
  const acts = ["ขออนุมัติใช้งาน", "ขอเพิ่มสิทธิ์", "ขอติดตั้ง", "ขอเปลี่ยนเวอร์ชัน", "ขอยกเลิกสิทธิ์"];
  return `${pick(apps)} - ${pick(acts)}`;
}

/** ชุดข้อมูล MOCK_REQUESTS ตามที่กำหนด (exception มีแค่ 4 ค่า ไม่ loop เพิ่มอย่างอื่น) */
export const MOCK_REQUESTS: RequestItem[] = Array.from({ length: 1250 }).map((_, i) => {
  const risk: RequestRisk = pick(["Low", "Medium", "High"]);
  const site = pick(FILTER_OPTIONS.sites);
  const exception = pick(FILTER_OPTIONS.exceptions);
  const dueAt = new Date(Date.now() + (i % 30) * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: 7300 + i,
    title: makeTitle(i),
    requester: "Puttaraporn Jitpranee",
    department: pick([
      "สำนักข่าว",
      "สำนักออกอากาศ",
      "สำนักตรวจสอบภายใน",
      "สำนักไฟฟ้ากำลัง",
      "สำนักเทคโนโลยีสารสนเทศ",
      "สำนักเทคนิคโทรทัศน์",
      "สำนักผังรายการ",
      "สำนักกรรมการบริหาร",
      "สำนักธุรกิจระหว่างประเทศ",
      "สำนักการพาณิชย์",
      "สำนักกิจการและสื่อสารองค์กร",
      "สำนักบริหาร",
      "สำนักดิจิทัลและกลยุทธ์สื่อใหม่",
      "สำนักการตลาด",
      "สำนักการเงินและบัญชี",
      "สำนักบริหารทรัพยากร",
      "สำนักผลิตรายการ",
    ]),
    site,
    risk,
    exception,
    dueAt,
  };
});

/* ─────────────────────────────────────────────────────────────────────────────
 * Types: Query/Response สำหรับ list
 * ────────────────────────────────────────────────────────────────────────────*/

export type RequestListQuery = {
  /** คีย์เวิร์ดค้นหา (title/requester/department/site/exception/id) */
  search?: string;
  /** กรองไซต์ */
  site?: (typeof FILTER_OPTIONS.sites)[number];
  /** กรองความเสี่ยง */
  risk?: RequestRisk;
  /** กรองประเภท exception (จำกัดที่ 4 ค่าเท่านั้น) */
  exception?: (typeof FILTER_OPTIONS.exceptions)[number];

  /** เรียงลำดับ */
  sortBy?:
    | "id"
    | "title"
    | "requester"
    | "department"
    | "site"
    | "exception"
    | "risk"
    | "risk_priority"
    | "dueAt";
  sortOrder?: "asc" | "desc";

  /** แบ่งหน้าแบบ 1-based */
  page?: number; // default 1
  pageSize?: number; // default 10
};

export type RequestListResponse = {
  items: RequestItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
};

/* ─────────────────────────────────────────────────────────────────────────────
 * Service APIs
 * ────────────────────────────────────────────────────────────────────────────*/

/** GET /requests/:id */
export async function getRequestById(id: string | number, signal?: AbortSignal): Promise<RequestItem | null> {
  await sleep(80, signal);
  const n = Number(id);
  if (Number.isFinite(n)) {
    return MOCK_REQUESTS.find((r) => r.id === n) ?? null;
  }
  // ถ้าเป็น string อื่น ๆ ลองค้นใน title
  const s = String(id);
  return (
    MOCK_REQUESTS.find((r) => r.title === s || String(r.id) === s) ?? null
  );
}

/** GET /requests (paged list with search/filter/sort) */
export async function getRequests(q: RequestListQuery, signal?: AbortSignal): Promise<RequestListResponse> {
  await sleep(150, signal);

  let filtered = [...MOCK_REQUESTS];

  // ----- search -----
  const search = (q.search ?? "").trim();
  if (search) {
    filtered = filtered.filter(
      (r) =>
        includesCI(r.title, search) ||
        includesCI(r.requester, search) ||
        includesCI(r.department, search) ||
        includesCI(r.site, search) ||
        includesCI(r.exception, search) ||
        includesCI(String(r.id), search),
    );
  }

  // ----- filters -----
  if (q.site) {
    const s = String(q.site);
    filtered = filtered.filter((r) => r.site === s);
  }
  if (q.risk) {
    const s = String(q.risk);
    filtered = filtered.filter((r) => r.risk === s);
  }
  if (q.exception) {
    const s = String(q.exception);
    filtered = filtered.filter((r) => r.exception === s);
  }

  // ----- sort (global ก่อน paginate) -----
  const dir = q.sortOrder === "desc" ? -1 : 1;
  const sortBy = q.sortBy ?? "dueAt";

  if (sortBy === "risk_priority") {
    // เรียงตามความเสี่ยง: High -> Medium -> Low (สำหรับ desc)
    const pr = new Map<RequestRisk, number>([
      ["High", 0],
      ["Medium", 1],
      ["Low", 2],
    ]);
    filtered.sort((a, b) => {
      const pa = pr.get(a.risk) ?? 999;
      const pb = pr.get(b.risk) ?? 999;
      if (pa !== pb) return (pa - pb) * dir;

      // secondary: dueAt asc
      const da = new Date(a.dueAt).getTime();
      const db = new Date(b.dueAt).getTime();
      if (da !== db) return (da - db) * dir;

      // tertiary: id asc
      return (a.id - b.id) * dir;
    });
  } else {
    filtered.sort((a, b) => {
      const A = (a as any)[sortBy];
      const B = (b as any)[sortBy];

      // number-aware
      if (typeof A === "number" && typeof B === "number") return (A - B) * dir;

      // date-aware (dueAt)
      const da = new Date(A as any);
      const db = new Date(B as any);
      const aIsDate = !isNaN(da.valueOf());
      const bIsDate = !isNaN(db.valueOf());
      if (aIsDate && bIsDate) return (da.getTime() - db.getTime()) * dir;

      // string compare
      return String(A).localeCompare(String(B), undefined, { numeric: true, sensitivity: "base" }) * dir;
    });
  }

  // ----- pagination (1-based) -----
  const totalCount = filtered.length;
  const page = Math.max(1, Number(q.page ?? 1));
  const pageSize = Math.max(1, Number(q.pageSize ?? 10));
  const start = (page - 1) * pageSize; // offset 0-based
  const items = filtered.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    items,
    totalCount,
    page,
    pageSize,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    totalPages,
  };
}

/** alias สำหรับสะดวกเรียกชื่ออื่นได้ */
export async function listRequests(q: RequestListQuery, signal?: AbortSignal): Promise<RequestListResponse> {
  return getRequests(q, signal);
}

/** helper: ดึง options (เช่นไปเติม dropdown) */
export async function getRequestFilterOptions(signal?: AbortSignal) {
  await sleep(60, signal);
  return {
    ...FILTER_OPTIONS,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Backward‑compatible aliases (สำหรับโค้ดเดิมที่ยังเรียกชื่อฟังก์ชันเก่า)
 * ────────────────────────────────────────────────────────────────────────────*/

// ให้ type เดิมชี้ไปหา type ใหม่ (เพื่อให้ที่อื่น ๆ compile ผ่าน)
export type ExceptionDefinitionListQuery = RequestListQuery;
export type ExceptionDefinitionListResponse = RequestListResponse;

// ถ้าโค้ดเดิมเรียกหา definition รายตัว
export async function getExceptionDefinitionById(
  id: string | number,
  signal?: AbortSignal,
) {
  // map ไปใช้ request ตัวเดียวกัน
  return getRequestById(id, signal);
}

// ฟังก์ชัน list เดิม → map ไปหา getRequests
export async function getExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionListResponse> {
  return getRequests(q, signal);
}

// alias ชื่อ listExceptionDefinitions (ถ้าโค้ดเดิมอ้างอิงชื่อนี้)
export async function listExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal,
): Promise<ExceptionDefinitionListResponse> {
  return getRequests(q, signal);
}
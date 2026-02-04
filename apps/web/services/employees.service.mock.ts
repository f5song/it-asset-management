// src/services/employees.service.mock.ts
import type {
  EmployeeItem,
  EmployeeStatus,
  EmployeesListQuery,
  EmployeesListResponse,
} from "@/types/employees";

// ──────────────────────────────────────────────────────────────────────────────
// Mock dataset
// ──────────────────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Finance",
  "HR",
  "Operations",
  "Sales",
] as const;

const STATUSES: EmployeeStatus[] = [
  "Active",
  "Inactive",
  "OnLeave",
  "Resigned",
];

// สร้างพนักงานจำลอง 73 รายการ
const MOCK_EMPLOYEES: EmployeeItem[] = Array.from({ length: 73 }).map(
  (_, i) => ({
    id: `E-${(i + 1).toString().padStart(3, "0")}`,
    name: `Employee ${i + 1}`,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    status: STATUSES[i % STATUSES.length],
    jobTitle: `Application Developer Specialist`,
    phone: `${(i + 1).toString().padStart(4, "0")}`,
    email: `puttaraporn.j@becworld.com`,
    device: `LAPTOP-${(i + 1).toString().padStart(3, "0")}`,
  }),
);

// ──────────────────────────────────────────────────────────────────────────────
// Utils
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
const includesCI = (text: string, q: string) => ci(text).includes(ci(q));

/** safe getter สำหรับ key ที่อาจไม่ใช่ keyof ตรง ๆ */
function getValue(obj: Record<string, unknown>, key: string) {
  return (obj as any)[key];
}

// ──────────────────────────────────────────────────────────────────────────────
/** 🔎 NEW: ค้นหาพนักงานแบบ quick search (mock) */
export async function searchEmployees(
  query: string,
  signal?: AbortSignal,
): Promise<EmployeeItem[]> {
  await sleep(120, signal);
  const q = (query ?? "").trim();
  if (!q) return [];
  const k = q.toLowerCase();
  // คืนผลลัพธ์ไม่เกิน 20 รายการพอสำหรับแสดง suggestion
  return MOCK_EMPLOYEES.filter(
    (e) =>
      e.id.toLowerCase().includes(k) ||
      e.name.toLowerCase().includes(k) ||
      (e.email ?? "").toLowerCase().includes(k) ||
      (e.department ?? "").toLowerCase().includes(k) ||
      (e.jobTitle ?? "").toLowerCase().includes(k) ||
      (e.device ?? "").toLowerCase().includes(k),
  ).slice(0, 20);
}

// ──────────────────────────────────────────────────────────────────────────────
// Mock Service API (ตามโครงสร้างใหม่)
// ──────────────────────────────────────────────────────────────────────────────

/** GET /employees/:id */
export async function getEmployeeById(
  id: string | number,
  signal?: AbortSignal,
): Promise<EmployeeItem | null> {
  await sleep(80, signal);
  return MOCK_EMPLOYEES.find((e) => String(e.id) === String(id)) ?? null;
}

/**
 * GET /employees (with filters/sort/pagination)
 * รูปแบบ query ที่รองรับ:
 *   - pageIndex (0-based), pageSize
 *   - search
 *   - status, department
 *   - sortBy, sortOrder (ถ้ามี)
 * รูปแบบ response: { items, totalCount, page (1-based), pageSize, hasNext, hasPrev }
 */
export async function listEmployees(
  q: EmployeesListQuery,
  signal?: AbortSignal,
): Promise<EmployeesListResponse> {
  await sleep(150, signal);

  let filtered = [...MOCK_EMPLOYEES];

  // ----- Search -----
  const search = (q.search ?? "").trim();
  if (search) {
    filtered = filtered.filter(
      (e) =>
        includesCI(e.id, search) ||
        includesCI(e.name, search) ||
        includesCI(e.department ?? "", search) ||
        includesCI(e.status, search) ||
        includesCI(e.email ?? "", search) ||
        includesCI(e.jobTitle ?? "", search) ||
        includesCI(e.phone ?? "", search) ||
        includesCI(e.device ?? "", search),
    );
  }

  // ----- Filters -----
  if (q.status) {
    const s = ci(q.status);
    filtered = filtered.filter((e) => ci(e.status) === s);
  }
  if (q.department) {
    const d = ci(q.department);
    filtered = filtered.filter((e) => ci(e.department) === d);
  }

  // ----- Sort (optional) -----
  if ((q as any).sortBy) {
    const sortBy = String((q as any).sortBy);
    const dir = (q as any).sortOrder === "desc" ? -1 : 1;
    filtered.sort((a, b) => {
      const A = getValue(a as any, sortBy) ?? "";
      const B = getValue(b as any, sortBy) ?? "";
      const As = typeof A === "string" ? A : String(A);
      const Bs = typeof B === "string" ? B : String(B);
      return As > Bs ? dir : As < Bs ? -dir : 0;
    });
  }

  // ----- Pagination (มาตรฐานใน type: page 1-based, pageSize) -----
  const page     = Math.max(1, Number((q as any).page ?? 1));      // 1-based
  const pageSize = Math.max(1, Number((q as any).pageSize ?? 10));
  const pageIndex = page - 1;                                      // internal offset
  const start   = pageIndex * pageSize;

  const totalCount = filtered.length;
  const items      = filtered.slice(start, start + pageSize);
  const hasPrev    = page > 1;
  const hasNext    = start + items.length < totalCount;

  return {
    items,
    totalCount,
    page,
    pageSize,
    hasNext,
    hasPrev,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/** ดึงทั้งหมดแบบเร็ว (ตั้ง pageSize ใหญ่) */
export async function getAllEmployeesQuick(
  signal?: AbortSignal,
): Promise<EmployeeItem[]> {
  const res = await listEmployees(
    { page: 1, pageSize: 9999, search: "" } as EmployeesListQuery,
    signal,
  );
  return res.items ?? [];
}


/** ดึงทั้งหมดแบบวนหน้า (robust) */
export async function getAllEmployees(
  signal?: AbortSignal,
): Promise<EmployeeItem[]> {
  const out: EmployeeItem[] = [];
  const pageSize = 50;
  let page = 1; // 1-based

  while (true) {
    const res = await listEmployees(
      { page, pageSize } as EmployeesListQuery,
      signal,
    );
    const items: EmployeeItem[] = res.items ?? [];
    out.push(...items);

    if (!res.hasNext) break; // ใช้ธงจาก response โดยตรง
    page += 1;
  }

  return out;
}
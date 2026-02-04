// src/mocks/data/exception.mock.ts

import {
  ExceptionAssignmentRow,
  ExceptionDefinition,
  PolicyStatus,
  // ✅ ใช้ type กลางที่นิยามไว้ใน "@/types/exception"
  ExceptionDefinitionListQuery,
  ExceptionDefinitionListResponse,
} from "@/types/exception";

// ---------- Mock dataset ----------

const STATUSES = ["Active", "Inactive", "Deprecated", "Archived"] as const satisfies readonly PolicyStatus[];
const OWNERS = ["SecOps", "IT", "Infra", "HR", "Compliance"] as const;
const USER_PREFIX = ["jirawee", "qa", "dev", "ops", "hr", "fin"] as const;

function pad(n: number, len = 3) { return n.toString().padStart(len, "0"); }
function iso(date: Date) { return date.toISOString(); }
function addDays(d: Date, days: number) { return new Date(d.getTime() + days * 24 * 60 * 60 * 1000); }

function makeDates(idx: number) {
  const created = addDays(new Date("2025-11-01T08:00:00Z"), idx);
  const lastUpdated = addDays(created, idx % 5);
  const reviewAt = addDays(created, ((idx % 3) + 1) * 30);
  return { createdAt: iso(created), lastUpdated: iso(lastUpdated), reviewAt: iso(reviewAt) };
}


function toDisplayName(employeeId: string): string {
  // mock: "dev.012" -> "Dev 012"
  const [p1, p2] = employeeId.split(".");
  return `${p1?.charAt(0).toUpperCase()}${p1?.slice(1)} ${p2}`;
}

// ---------- Definitions (Catalog) ----------
// สมมุติว่ามี helpers พวก pad(), STATUSES, makeDates(i) เหมือนเดิม
const NAMES = [
  "Allow LINE on PC",
  "Allow USB storage",
  "Bypass Proxy",
] as const;

const MOCK_DEFINITIONS: ExceptionDefinition[] = Array.from({ length: 24 }).map((_, i) => {
  const idNum = i + 1;
  const id = `EXC-${pad(idNum)}`;
  const status = STATUSES[(i * 3) % STATUSES.length];
  const { createdAt, lastUpdated } = makeDates(i);

  const total = (i % 7) + 3;

  return {
    id,
    name: NAMES[i % NAMES.length],                    // ✅ ต้องมี name
    status,
    risk: (["Low", "Medium", "High"] as const)[i % 3],
    createdAt,
    lastUpdated,
    notes: "",
    totalAssignments: total,                          // ✅ อยู่ใน type
  };
});


// ---------- Assignments (Per definition) ----------
const MOCK_ASSIGNMENTS: Record<string, ExceptionAssignmentRow[]> = {};
for (const def of MOCK_DEFINITIONS) {
  const total = def.totalAssignments ?? 0;
  const rows: ExceptionAssignmentRow[] = [];
  for (let i = 0; i < total; i++) {
    const employeeId = `${USER_PREFIX[i % USER_PREFIX.length]}.${pad((i % 20) + 1)}`;
    const employeeName = toDisplayName(employeeId);
    const assignedAt = addDays(new Date(def.createdAt), i).toISOString();
  

    rows.push({
      id: `${def.id}-U-${pad(i + 1)}`,
      definitionId: def.id,
      employeeId,
      employeeName,
      department: ["IT","HR","FIN","OPS"][i % 4],
      notes: i % 2 === 0 ? "Demo assignment note" : null,
    });
  }
  MOCK_ASSIGNMENTS[def.id] = rows;
}

// ---------- Utils ----------
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

// ---------- Service API (Definitions) ----------
// ✅ ใช้ type กลาง: ExceptionDefinitionListQuery / ExceptionDefinitionListResponse
export async function getExceptionDefinitionById(
  id: string | number,
  signal?: AbortSignal
): Promise<ExceptionDefinition | null> {
  await sleep(80, signal);
  return MOCK_DEFINITIONS.find((x) => String(x.id) === String(id)) ?? null;
}

export async function getExceptionDefinitions(
  q: ExceptionDefinitionListQuery,
  signal?: AbortSignal
): Promise<ExceptionDefinitionListResponse> {
  await sleep(150, signal);

  let filtered = [...MOCK_DEFINITIONS];

  // ✅ search (แก้ชื่อแปรให้ถูก และใช้ key มาตรฐาน)
  const search = (q.search ?? "").trim();
  if (search) {
    filtered = filtered.filter(
      (e) =>
        includesCI(e.id, search) ||
        includesCI(e.name, search) ||
        includesCI(String(e.status), search)
    );
  }

  // ✅ filters (ใช้ชื่อ key มาตรฐาน: status, category, owner)
  if (q.status) {
    const s = ci(q.status);
    filtered = filtered.filter((e) => ci(e.status) === s);
  }

  // sort
  if (q.sortBy) {
    const dir = q.sortOrder === "desc" ? -1 : 1;
    const key = q.sortBy as keyof ExceptionDefinition;
    filtered.sort((a, b) => {
      const A = (a[key] as any) ?? "";
      const B = (b[key] as any) ?? "";
      return A > B ? dir : A < B ? -dir : 0;
    });
  }

  // ✅ pagination (OffsetPage<T> รูปแบบเดียวกับทั้งระบบ)
  const totalCount = filtered.length;
  const page = Math.max(1, Number(q.page ?? 1));
  const pageSize = Math.max(1, Number(q.pageSize ?? 10));
  const start = (page - 1) * pageSize;
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

// ---------- Service API (Assignments per definition) ----------
export async function getExceptionAssignmentsByDefinitionId(
  id: string,
  signal?: AbortSignal
): Promise<ExceptionAssignmentRow[]> {
  await sleep(120, signal);
  return [...(MOCK_ASSIGNMENTS[id] ?? [])];
}
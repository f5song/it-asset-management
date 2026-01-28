// src/services/exceptions.service.mock.ts
import type {
  ExceptionItem,
  ExceptionCategory,
  ExceptionGroup,
  ExceptionScope,
} from "types/exception";

// ---------- Mock dataset ----------
const CATEGORIES: readonly ExceptionCategory[] = [
  "AI",
  "USBDrive",
  "MessagingApp",
  "ADPasswordPolicy",
] as const;

const GROUPS: readonly ExceptionGroup[] = [
  "Approved",
  "Pending",
  "Expired",
  "Revoked",
] as const;

const SCOPES: readonly ExceptionScope[] = [
  "User",
  "Device",
  "Group",
  "Tenant",
] as const;

const OWNERS = ["SecOps", "IT", "Infra", "HR", "Compliance"] as const;
const TARGET_PREFIX = ["jirawee", "qa", "dev", "ops", "hr", "fin"] as const;

function pad(n: number, len = 3) {
  return n.toString().padStart(len, "0");
}
function iso(date: Date) {
  return date.toISOString();
}
function makeDates(idx: number) {
  const base = new Date("2025-11-01T08:00:00Z").getTime();
  const created = new Date(base + idx * 24 * 60 * 60 * 1000);
  const expireStep = ((idx % 3) + 1) * 15; // 15/30/45 days
  const expires = new Date(created.getTime() + expireStep * 24 * 60 * 60 * 1000);
  return { createdAt: iso(created), expiresAt: iso(expires) };
}
function resolveExpires(group: ExceptionGroup, _createdAtISO: string, expiresAtISO: string) {
  if (group === "Pending" || group === "Approved") return expiresAtISO;
  if (group === "Expired") return expiresAtISO;
  if (group === "Revoked") return null;
  return null;
}
function makeName(category: ExceptionCategory, scope: ExceptionScope, target: string) {
  switch (category) {
    case "AI":
      return `Allow AI tools for ${scope.toLowerCase()}: ${target}`;
    case "USBDrive":
      return `Allow USB storage for ${scope.toLowerCase()}: ${target}`;
    case "MessagingApp":
      return `Allow LINE for ${scope.toLowerCase()}: ${target}`;
    case "ADPasswordPolicy":
      return `Relax AD password policy for ${scope.toLowerCase()}: ${target}`;
    default:
      return `Exception for ${scope.toLowerCase()}: ${target}`;
  }
}

const MOCK_EXCEPTIONS: ExceptionItem[] = Array.from({ length: 84 }).map((_, i) => {
  const idNum = i + 1;
  const category = CATEGORIES[i % CATEGORIES.length];
  const group = GROUPS[(i * 3) % GROUPS.length];
  const scope = SCOPES[(i * 5) % SCOPES.length];
  const targetSeed = `${TARGET_PREFIX[i % TARGET_PREFIX.length]}.${pad((i % 20) + 1)}`;
  const owner = OWNERS[(i * 7) % OWNERS.length];

  const { createdAt, expiresAt } = makeDates(i);
  const finalExpires = resolveExpires(group, createdAt, expiresAt);

  return {
    id: `EXC-${pad(idNum)}`,
    name: makeName(category, scope, targetSeed),
    category,
    group,
    scope,
    target: scope === "Tenant" ? "Tenant" : targetSeed,
    owner,
    createdAt,
    expiresAt: finalExpires,
  };
});

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

// ---------- Types (สำหรับ service นี้) ----------
export type ExceptionItemsQuery = {
  page?: number;             // 1-based
  limit?: number;
  sortBy?: keyof ExceptionItem | string;
  sortOrder?: "asc" | "desc";
  // filters
  searchText?: string;
  groupFilter?: ExceptionGroup | string;
  categoryFilter?: ExceptionCategory | string;
  scopeFilter?: ExceptionScope | string;
  ownerFilter?: string;
  targetFilter?: string;
};

export type ExceptionItemsResponse = {
  data: ExceptionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ---------- Service API ----------
export async function getExceptionById(
  id: string | number,
  signal?: AbortSignal
): Promise<ExceptionItem | null> {
  await sleep(80, signal);
  return MOCK_EXCEPTIONS.find((x) => String(x.id) === String(id)) ?? null;
}

export async function getExceptions(
  q: ExceptionItemsQuery,
  signal?: AbortSignal
): Promise<ExceptionItemsResponse> {
  await sleep(150, signal);

  let filtered = [...MOCK_EXCEPTIONS];

  // search
  const searchText = (q.searchText ?? "").trim();
  if (searchText) {
    filtered = filtered.filter(
      (e) =>
        includesCI(e.id, searchText) ||
        includesCI(e.name, searchText) ||
        includesCI(e.target, searchText) ||
        includesCI(e.owner ?? "", searchText) ||
        includesCI(e.category, searchText) ||
        includesCI(e.group, searchText) ||
        includesCI(e.scope, searchText)
    );
  }

  // filters
  if (q.groupFilter) {
    const s = ci(q.groupFilter);
    filtered = filtered.filter((e) => ci(e.group) === s);
  }
  if (q.categoryFilter) {
    const s = ci(q.categoryFilter);
    filtered = filtered.filter((e) => ci(e.category) === s);
  }
  if (q.scopeFilter) {
    const s = ci(q.scopeFilter);
    filtered = filtered.filter((e) => ci(e.scope) === s);
  }
  if (q.ownerFilter) {
    const s = ci(q.ownerFilter);
    filtered = filtered.filter((e) => includesCI(e.owner ?? "", s));
  }
  if (q.targetFilter) {
    const s = ci(q.targetFilter);
    filtered = filtered.filter((e) => includesCI(e.target, s));
  }

  // sort
  if (q.sortBy) {
    const dir = q.sortOrder === "desc" ? -1 : 1;
    const key = q.sortBy as keyof ExceptionItem;
    filtered.sort((a, b) => {
      const A = (a[key] as any) ?? "";
      const B = (b[key] as any) ?? "";
      return A > B ? dir : A < B ? -dir : 0;
    });
  }

  // page
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

// ดึงทั้งหมด (เร็ว)
export async function getAllExceptionsQuick(signal?: AbortSignal): Promise<ExceptionItem[]> {
  const res = await getExceptions({ page: 1, limit: 9999 }, signal);
  return res.data;
}

// ดึงทั้งหมด (ทีละหน้า)
export async function getAllExceptions(signal?: AbortSignal): Promise<ExceptionItem[]> {
  const limit = 100;
  let page = 1;
  const out: ExceptionItem[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await getExceptions({ page, limit }, signal);
    out.push(...res.data);
    if (page >= res.pagination.totalPages) break;
    page += 1;
  }
  return out;
}

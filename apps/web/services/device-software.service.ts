import { ClientServer, SoftwareType } from "types";

// services/device-software.service.ts
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";


export type DeviceSoftwareRow = {
  id: string;                 // software id
  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;

  // เดิมใน DeviceSoftwareRow
  policyCompliance?: "Compliant" | "Non-Compliant" | "Exception" | "Unknown";
  licenseStatus?: "Licensed" | "Unlicensed" | "Expired" | "Trial" | "Unknown";
  lastScan?: string | null;

  //   ขยายเพิ่มเพื่อรวมเคส BundledSoftwareRow (ตั้ง optional เพื่อไม่บังคับแหล่งข้อมูลทั้งหมด)
  expiryDate?: string | null;
  softwareType?: SoftwareType;
  clientServer?: ClientServer;
};


export type Paged<T> = { items: T[]; total: number };

export type DeviceSoftwareQuery = {
  page: number;                 // 1-based
  pageSize: number;
  sortBy?: "softwareName" | "manufacturer" | "version" | "category" | "lastScan";
  sortOrder?: "asc" | "desc";
  search?: string;
  manufacturer?: string;
  category?: string;
  compliance?: string;          // e.g. "compliant" | "non-compliant"
};

// --------- Helper (ป้องกัน Invalid URL) ----------
function getBaseUrl(): string {
  const base =
    (typeof window !== "undefined" ? window.location.origin : undefined) ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (!base) throw new Error("apiFetch base URL not configured");
  return base;
}

async function apiFetch<T>(
  path: string,
  query?: Record<string, any>,
  init?: RequestInit
): Promise<T> {
  const base = getBaseUrl();
  const url = new URL(path, base);

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}\n${text}`);
    }
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  return (isJson ? await res.json() : await res.text()) as T;
}

// --------- MOCK BRANCH ----------
async function fetchDeviceSoftwareMock(
  deviceId: string | number,
  q: DeviceSoftwareQuery
): Promise<Paged<DeviceSoftwareRow>> {
  // หน่วงเวลาเล็กน้อยให้เหมือนของจริง
  await new Promise((r) => setTimeout(r, 120));

  // สร้าง mock ต่ออุปกรณ์ (คงที่)
  const seedCount = 23;
  let data: DeviceSoftwareRow[] = Array.from({ length: seedCount }).map((_, i) => ({
    id: `soft-${i + 1}`,
    softwareName: `Tool ${i + 1}`,
    manufacturer: ["Microsoft", "Adobe", "JetBrains", "Autodesk"][i % 4],
    version: `v${Math.floor(i / 10)}.${i % 10}`,
    category: ["IDE", "Security", "Design", "CAD"][i % 4],
    policyCompliance: (["Compliant", "Non-Compliant", "Exception", "Unknown"][i % 4] as any),
    licenseStatus: (["Licensed", "Unlicensed", "Expired", "Trial"][i % 4] as any),
    lastScan: "2026-01-05",
  }));

  // Filter
  if (q.search) {
    const s = q.search.toLowerCase();
    data = data.filter(
      (x) =>
        x.softwareName.toLowerCase().includes(s) ||
        x.manufacturer.toLowerCase().includes(s) ||
        x.version.toLowerCase().includes(s)
    );
  }
  if (q.manufacturer) data = data.filter((x) => x.manufacturer === q.manufacturer);
  if (q.category) data = data.filter((x) => x.category === q.category);
  if (q.compliance)
    data = data.filter(
      (x) => (x.policyCompliance || "").toLowerCase() === q.compliance!.toLowerCase()
    );

  // Sort
  const sortBy = q.sortBy || "softwareName";
  const sortOrder = q.sortOrder || "asc";
  data.sort((a: any, b: any) => {
    const A = a[sortBy];
    const B = b[sortBy];
    if (A < B) return sortOrder === "asc" ? -1 : 1;
    if (A > B) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const start = (q.page - 1) * q.pageSize;
  const items = data.slice(start, start + q.pageSize);

  return { items, total: data.length };
}

// --------- REAL BRANCH ----------
async function fetchDeviceSoftwareReal(
  deviceId: string | number,
  q: DeviceSoftwareQuery
): Promise<Paged<DeviceSoftwareRow>> {
  // สมมุติ backend ของคุณจะทำ paging/filter/sort ให้เรียบร้อย
  return apiFetch<Paged<DeviceSoftwareRow>>(
    `/api/devices/${deviceId}/software`,
    {
      page: q.page,
      pageSize: q.pageSize,
      sortBy: q.sortBy,
      sortOrder: q.sortOrder,
      search: q.search,
      manufacturer: q.manufacturer,
      category: q.category,
      compliance: q.compliance,
    }
  );
}

// --------- PUBLIC API (UI/Hook เรียกอันนี้ตัวเดียว) ----------
export async function fetchDeviceSoftware(
  deviceId: string | number,
  q: DeviceSoftwareQuery
): Promise<Paged<DeviceSoftwareRow>> {
  if (USE_MOCK) return fetchDeviceSoftwareMock(deviceId, q);
  return fetchDeviceSoftwareReal(deviceId, q);
}

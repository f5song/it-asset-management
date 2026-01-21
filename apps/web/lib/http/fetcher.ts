
// lib/http/fetcher.ts
type FetchOptions = {
  baseUrl?: string;
  query?: Record<string, any>;
  init?: RequestInit;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { baseUrl, query, init } = options;

  // 1) เตรียม base
  const base =
    baseUrl ??
    (typeof window !== "undefined" ? window.location.origin : undefined) ??
    process.env.NEXT_PUBLIC_API_URL ?? // external API base ถ้ามี
    process.env.NEXT_PUBLIC_SITE_URL;   // หรือ base ของเว็บเอง (ใช้ internal route)

  if (!base) {
    throw new Error(
      `apiFetch: Missing base URL for relative path "${path}". ` +
      `Provide options.baseUrl or define NEXT_PUBLIC_API_URL/NEXT_PUBLIC_SITE_URL.`
    );
  }

  // 2) สร้าง URL อย่างถูกต้อง (relative + base)
  const url = new URL(path, base);

  // 3) ใส่ query แบบปลอดภัย
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  // 4) ยิง fetch
  const res = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`apiFetch: ${res.status} ${res.statusText} — ${url} — ${text}`);
  }

  // 5) แปลงผลลัพธ์
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = (isJson ? await res.json() : (await res.text())) as T;
  return data;
}

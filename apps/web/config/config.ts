// src/config/config.ts (แทนที่ไฟล์เดิมได้เลย)

const IS_SERVER = typeof window === "undefined";
let _apiBase: string | null = null;

/** อ่าน API base URL อย่างปลอดภัย (รองรับทั้ง server/client) */
export function getApiBase(): string {
  if (_apiBase !== null) return _apiBase;

  const val =
    (IS_SERVER ? process.env.API_BASE : undefined) ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "";

  if (!val.trim()) {
    // ทางเลือก: fallback ใน dev เพื่อกัน build dev พัง
    if (process.env.NODE_ENV !== "production") {
      _apiBase = "http://backend:8000";
      return _apiBase;
    }
    throw new Error(
      "API base URL is not set. Please set API_BASE in .env.local (or NEXT_PUBLIC_API_BASE_URL for client)."
    );
  }

  _apiBase = val.trim();
  return _apiBase;
}

/** รวม path ต่อท้าย base อย่างปลอดภัย */
export function buildUrl(path: string): string {
  const p = String(path ?? "");
  if (/^https?:\/\//i.test(p)) return p;

  const base = getApiBase().replace(/\/+$/, "");
  const suffix = p.replace(/^\/+/, "");
  return `${base}/${suffix}`;
}

/** (ไม่บังคับ) ตรวจ ENV ตอน start เฉพาะ production */
export function assertApiBase(): void {
  if (process.env.NODE_ENV === "production") {
    void getApiBase(); // ถ้าขาด จะ throw ที่นี่ตอน start
  }
}
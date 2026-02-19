// config.ts
// อ่าน ENV แล้ว cast ให้เป็น string ที่ TS รับได้ จากนั้น guard ซ้ำที่ runtime
const SERVER_API_BASE: string =
  (process.env.API_BASE as string | undefined) ??
  (process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined) ??
  '';

if (!SERVER_API_BASE) {
  throw new Error(
    'API base URL is not set. Please set API_BASE in .env.local (or NEXT_PUBLIC_API_BASE_URL for client).',
  );
}

/** รวม path ต่อท้าย base อย่างปลอดภัย */
export function buildUrl(path: string) {
  // ถ้า path เป็น absolute URL อยู่แล้ว ให้คืนเลย
  if (/^https?:\/\//i.test(path)) return path;

  const base = SERVER_API_BASE.replace(/\/+$/, '');
  const suffix = String(path || '').replace(/^\/+/, '');
  return `${base}/${suffix}`;
}
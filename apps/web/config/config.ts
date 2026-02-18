// config.ts (แนะนำแยกไฟล์ config ไว้รวมศูนย์)
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

/**
 * รวม path ต่อท้าย API_BASE อย่างปลอดภัย
 * - ตัด/เติม slash ให้ถูก
 */
export function buildUrl(path: string) {
  const base = API_BASE.replace(/\/+$/, '');      // เอา / ท้าย base ออก
  const suffix = path.replace(/^\/+/, '');        // เอา / ต้น path ออก
  return `${base}/${suffix}`;
}
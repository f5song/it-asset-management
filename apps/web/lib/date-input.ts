// src/utils/date-input.ts
import type { DateInput } from "./date";

/** ISO/Date -> "YYYY-MM-DDTHH:mm" (เวลาท้องถิ่นของเบราว์เซอร์) */
export function toLocalInput(input: DateInput): string {
  if (input == null) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/** "YYYY-MM-DDTHH:mm" (local) -> ISO UTC string (ส่งกลับ server) */
export function fromLocalInputToISO(local?: string | null): string | null {
  if (!local) return null;
  const d = new Date(local); // ตีความเป็น local time
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString(); // แปลงเป็น UTC + 'Z'
}
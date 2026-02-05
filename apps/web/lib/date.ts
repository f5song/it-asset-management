// src/utils/date.ts
export type DateInput = string | number | Date | null | undefined;

const FALLBACK = "—";

function toDateSafe(input: DateInput): Date | null {
  if (input == null) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 1) UI ไทย — ใช้ใน dashboard ขององค์กรไทย */
export function formatDateTH(input: DateInput): string {
  const d = toDateSafe(input);
  if (!d) return FALLBACK;
  return d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** 2) UI สากล — ระบุ locale ได้ (ค่าปริยาย en-US) */
export function formatDateTime(input: DateInput, locale = "en-US", withSeconds = false): string {
  const d = toDateSafe(input);
  if (!d) return FALLBACK;
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
  });
}

/** 3) Deterministic (UTC) — ใช้ใน CSV/Logs/Test/Audit ให้ได้ผลลัพธ์เท่ากันทุกเครื่อง */
export function formatDateUTC(input: DateInput): string {
  const d = toDateSafe(input);
  if (!d) return FALLBACK;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(d);
}

/** (Option) alias semantic ชื่อจำง่ายใน component ฝั่งระบบ */
export const formatDateSafe = formatDateUTC;
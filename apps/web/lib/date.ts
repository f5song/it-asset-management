// src/utils/date.ts
export type DateInput = string | number | Date | null | undefined;

const FALLBACK = "—";

function toDateSafe(input: DateInput): Date | null {
  if (input == null) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** pad เลขให้ 2 หลัก */
function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

/** ─────────────────────────────────────────────────────────
 *  Single Source of Truth: รูปแบบ DMY ด้วยเครื่องหมาย -
 *  useUTC = true → ใช้เวลา UTC (ผลคงที่ข้ามเครื่อง)
 *  useUTC = false → ใช้เวลา Local ของผู้ใช้
 *  ─────────────────────────────────────────────────────────
 */

/** วันที่ล้วน: dd-MM-yyyy  (เช่น 11-02-2026) */
export function formatDateDMY(input: DateInput, useUTC = false): string {
  const d = toDateSafe(input);
  if (!d) return FALLBACK;

  const dd = useUTC ? d.getUTCDate() : d.getDate();
  const mm = (useUTC ? d.getUTCMonth() : d.getMonth()) + 1;
  const yyyy = useUTC ? d.getUTCFullYear() : d.getFullYear();

  return `${pad2(dd)}-${pad2(mm)}-${yyyy}`;
}

/** วันที่ + เวลา: dd-MM-yyyy HH:mm (เช่น 11-02-2026 16:05) */
export function formatDateTimeDMY(input: DateInput, useUTC = false): string {
  const d = toDateSafe(input);
  if (!d) return FALLBACK;

  const dd = useUTC ? d.getUTCDate() : d.getDate();
  const mm = (useUTC ? d.getUTCMonth() : d.getMonth()) + 1;
  const yyyy = useUTC ? d.getUTCFullYear() : d.getFullYear();
  const hh = useUTC ? d.getUTCHours() : d.getHours();
  const min = useUTC ? d.getUTCMinutes() : d.getMinutes();

  return `${pad2(dd)}-${pad2(mm)}-${yyyy} ${pad2(hh)}:${pad2(min)}`;
}

/** ───────── Legacy API (ยังคง export ไว้ แต่เปลี่ยนภายในให้ไปทางเดียวกัน) ───────── */

/** 1) UI ไทยเดิม → บังคับ dd-MM-yyyy */
export function formatDateTH(input: DateInput): string {
  return formatDateDMY(input, false);
}

/** 2) UI สากลเดิม → ปรับให้เข้ารูปแบบระบบ dd-MM-yyyy HH:mm */
export function formatDateTime(input: DateInput, _locale = "en-US", withSeconds = false): string {
  const base = formatDateTimeDMY(input, false);
  if (!withSeconds || base === FALLBACK) return base;

  // ต่อวินาทีจากเวลาเดิม (local)
  const d = toDateSafe(input);
  if (!d) return FALLBACK;
  return `${base}:${pad2(d.getSeconds())}`;
}

/** 3) Deterministic (UTC) เดิม → บังคับ dd-MM-yyyy HH:mm (UTC) */
export function formatDateUTC(input: DateInput): string {
  return formatDateTimeDMY(input, true);
}

/** (Option) alias semantic ชื่อจำง่ายใน component ฝั่งระบบ */
export const formatDateSafe = formatDateUTC;

/** ใช้แทน formatDue เดิม เพื่อให้สอดคล้อง dd-MM-yyyy HH:mm */
export function formatDue(input: DateInput, useUTC = false): string {
  return formatDateTimeDMY(input, useUTC);
}
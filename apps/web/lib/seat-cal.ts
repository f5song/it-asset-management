// src/components/assign/SeatUtils.ts
import type { LicenseItem } from "types";
import type { SeatCountUnit } from "types/assign";

// แปลง DD-MM-YYYY -> YYYY-MM-DD
export const toISO = (ddmmyyyy: string): string => {
  const [dd, mm, yyyy] = ddmmyyyy.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

// perType: "per_user" | "per_device"
export const isPerDevice = (l: LicenseItem) => l.perType === "per_device";
export const isPerUser = (l: LicenseItem) => l.perType === "per_user";

// รวมจำนวน seat ที่กิน
export const sumSeats = (units: SeatCountUnit[]) =>
  units.reduce((n, u) => n + u.amount, 0);

// ตัดให้พอดีกับ available แบบง่าย (เรียงตามลำดับ)
export function trimUnitsToAvailable(units: SeatCountUnit[], available: number) {
  const out: SeatCountUnit[] = [];
  let remain = available;
  for (const u of units) {
    if (remain <= 0) break;
    const use = Math.min(u.amount, remain);
    if (use > 0) out.push({ ...u, amount: use });
    remain -= use;
  }
  return out;
}
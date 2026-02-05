// lib/mappers/softwareFilterMappers.ts
import type { FilterValues } from "types";
import type { SoftwareFilters, SoftwareType } from "types";
import { toUndef } from "lib/filters";

/**
 * Simple Filter ของหน้า Software
 * - ไม่มี status แล้ว => ใช้ TStatus = never
 */
export type SoftwareSimple = FilterValues<never, SoftwareType>;

/* ---------------------------------------------
 * Domain -> Simple (UI)
 * -------------------------------------------*/
export function toSimpleFilters(df: SoftwareFilters = {}): SoftwareSimple {
  return {
    // ไม่มี status: ไม่ต้องคืนค่า field status
    type: toUndef(df.type),
    manufacturer: toUndef(df.manufacturer),
    search: df.search ?? "",
  };
}

/* ---------------------------------------------
 * Simple -> Domain
 * -------------------------------------------*/
export function toDomainFilters(sf?: SoftwareSimple): SoftwareFilters {
  if (!sf) return {};
  return {
    // ไม่มี status
    type: toUndef(sf.type),
    manufacturer: toUndef(sf.manufacturer),
    search: sf.search ?? "",
  };
}

/* ---------------------------------------------
 * Simple -> Service (ตัวอย่าง mapping สำหรับ call API)
 * - ปรับ key ชื่อให้เข้ากับ backend ได้ตามจริง
 * -------------------------------------------*/
export function toServiceFilters(
  sf: SoftwareSimple
): Pick<SoftwareFilters, "type" | "manufacturer" | "search"> {
  return {
    // ไม่มี status
    type: toUndef(sf.type),
    manufacturer: toUndef(sf.manufacturer),
    search: sf.search ?? "",
  };
}
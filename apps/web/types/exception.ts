// src/types/exception.ts
import type { OffsetPage, OffsetPaginationParams, Searchable } from "./common";

/**
 * หมายเหตุความเข้ากันได้กับ services:
 * - services/exceptions.service.ts ใช้:
 *   - ExceptionDefinitionListQuery: มี page (1-based), pageSize
 *   - ExceptionDefinitionListResponse: ต้องมีคีย์
 *     items, totalCount, page, pageSize, totalPages, hasNext, hasPrev
 *
 * ถ้าในโปรเจกต์ของคุณไฟล์ ./common ยังไม่ได้กำหนดชนิดเหล่านี้ตามนี้
 * คุณสามารถใช้ definition ตัวอย่างด้านล่าง (ย้ายไป common ก็ได้):
 *
 * // export type OffsetPaginationParams = { page?: number; pageSize?: number };
 * // export type OffsetPage<T> = {
 * //   items: T[];
 * //   totalCount: number;
 * //   page: number;      // 1-based
 * //   pageSize: number;
 * //   totalPages: number;
 * //   hasNext: boolean;
 * //   hasPrev: boolean;
 * // };
 * // export type Searchable = { search?: string };
 */

/** สถานะของ "นโยบายข้อยกเว้น" (Policy-level) */
export type PolicyStatus = "Active" | "Inactive";
export type RiskLevel = "Low" | "Medium" | "High";


/**
 * ExceptionDefinition: รายการ "นโยบายยกเว้น" ในระบบ (ระดับ Catalog)
 */
export interface ExceptionDefinition {
  id: string;                  // EXC-001 (แนะนำใช้ string เพื่อรองรับ EXC-xxx)
  name: string;                // เช่น "Allow LINE on PC" / "Allow USB storage"
  status: PolicyStatus;        // Active | Inactive | Deprecated | Archived
  risk: RiskLevel;
  createdAt: string;           // ISO
  lastUpdated?: string | null; // ISO
  description?: string;
  // สถิติการมอบหมาย (สำหรับ UI)
  totalAssignments?: number;   // รวมทั้งหมด
}

/**
 * Assignment (User-only): ใครได้รับ exception definition นี้บ้าง
 */
export type ExceptionAssignmentRow = {
  id: string;          // mapping id หรือ userId (ผ่อนคลายเป็น number ได้)
  definitionId: string;         // FK -> ExceptionDefinition.id
  employeeId: string;           // ผู้ใช้ที่ได้รับสิทธิ์
  employeeName?: string | null;
  department?: string | null;
  assignedBy?: string | null;
  assignedAt?: string | null;   // ISO
  expiresAt?: string | null;    // ISO
  status?: "Active" | "Pending" | "Revoked";
  notes?: string | null;
};

/** ฟิลเตอร์หน้า Inventory (Definition-level) — ใช้คีย์มาตรฐาน search */
export type ExceptionDomainFilters = {
  search?: string;
  status?: PolicyStatus;
  owner?: string;
};

/** ฟิลเตอร์แบบ UI (ใช้ใน FilterBar) */
export type ExceptionFilterValues = {
  status?: PolicyStatus; // map -> status
  search?: string;       // keyword
};

/** สำหรับแบบฟอร์ม Edit ของ Definition (ไม่ใช่คำขอ) */
export type ExceptionEditValues = {
  name: string;
  status: PolicyStatus;
  risk: RiskLevel;
  createdAt: string;           // datetime-local หรือ ISO
  lastUpdated?: string | null; // datetime-local หรือ ISO
  reviewAt?: string | null;    // datetime-local หรือ ISO
  notes?: string;
};

/** ✅ Query/Response ของ Definition list (สำหรับ service/hook)
 * - services ใช้ page (1-based), pageSize, search, status
 */
export type ExceptionDefinitionListQuery =
  OffsetPaginationParams &
  Searchable &
  ExceptionDomainFilters;

export type ExceptionDefinitionListResponse = OffsetPage<ExceptionDefinition>;

/** ✅ Query/Response ของ Assignment list (ถ้ามีหน้ารายการผู้ได้รับสิทธิ์)
 * - ถ้าจะใช้หน้ารายการผู้รับสิทธิ์แบบแยก สามารถอิงโครงสร้างนี้ได้
 */
export type ExceptionAssignmentListQuery =
  OffsetPaginationParams &
  Searchable & {
    definitionId?: string;      // กรองตาม definition
    status?: "Active" | "Pending" | "Expired";
    department?: string;
  };

export type ExceptionAssignmentListResponse = OffsetPage<ExceptionAssignmentRow>;

/** ✅ Canonical: Payload/Result สำหรับ Assign แบบ bulk */
export type AssignExceptionsToEmployeesPayload = {
  employeeIds: string[];       // กลุ่มพนักงาน
  definitionIds: string[];     // ข้อยกเว้นหลายรายการ
  effectiveDate?: string;      // YYYY-MM-DD
  expiresAt?: string | null;   // (ถ้ามี)
  notes?: string;
};

export type AssignExceptionsToEmployeesResult = {
  ok: boolean;
  assignedCount: number;       // จำนวนพนักงานที่ได้รับมอบหมาย
  definitionIds: string[];
};

export type AssignEmployeeInput = {
  employeeId: string;
  employeeName?: string;
  department?: string;
  notes?: string | null;
};

export type AssignOptions = {
  /** ข้ามถ้ามีอยู่แล้ว (default: true) */
  skipIfExists?: boolean;
  /** ถ้า record มีอยู่แล้ว ให้อัปเดตชื่อ/แผนก (default: true) */
  upsertNameAndDept?: boolean;
  /** กลยุทธ์ note เมื่อ record มีอยู่แล้ว (default: 'keep-existing') */
  noteStrategy?: "keep-existing" | "replace" | "append";
  /** ตัวคั่นเวลา append note (default: ' | ') */
  noteAppendSeparator?: string;
};

/** ---------- ส่วนจำลอง Request (อีกโดเมนหนึ่ง) ---------- */
/** ความเสี่ยงระดับคำขอ (distinct จาก RiskLevel ได้ ถ้าต้องการ) */
export type RequestRisk = "Low" | "Medium" | "High";

export type RequestItem = {
  id: number;
  title: string;
  requester: string;
  department: string;
  site: string;
  risk: RequestRisk;
  exception: string;
  dueAt: string; // ISO
};

/** RequestQuery ใช้ pageIndex 0-based (ต่างจาก Definition list ที่ 1-based) */
export type RequestQuery = {
  pageIndex: number;  // 0-based
  pageSize: number;
  filters?: {
    site?: string;
    risk?: RequestRisk | string;
    exception?: string;
    search?: string;
  };
};

export type RequestListResponse = {
  items: RequestItem[];
  total: number;
};
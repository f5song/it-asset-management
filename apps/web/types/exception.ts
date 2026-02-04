// src/types/exception.ts
import type { OffsetPage, OffsetPaginationParams, Searchable } from "./common";

/** สถานะของ "นโยบายข้อยกเว้น" (Policy-level) */
export type PolicyStatus = "Active" | "Inactive" | "Deprecated" | "Archived";
export type RiskLevel = "Low" | "Medium" | "High";

/**
 * ExceptionDefinition: รายการ "นโยบายยกเว้น" ในระบบ (ระดับ Catalog)
 */
export interface ExceptionDefinition {
  id: string;                  // EXC-001
  name: string;                // เช่น "Allow LINE on PC" / "Allow USB storage"
  status: PolicyStatus;        // Active | Inactive | Deprecated | Archived
  risk?: RiskLevel;
  createdAt: string;           // ISO
  lastUpdated?: string | null; // ISO
  notes?: string;

  // สถิติการมอบหมาย (สำหรับ UI)
  totalAssignments?: number;   // รวมทั้งหมด
}

/**
 * Assignment (User-only): ใครได้รับ exception definition นี้บ้าง
 */
export type ExceptionAssignmentRow = {
  id: string;                   // mapping id หรือ userId
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
  notes: string;
};

/** ✅ Query/Response ของ Definition list (สำหรับ service/hook) */
export type ExceptionDefinitionListQuery =
  OffsetPaginationParams &
  Searchable &
  ExceptionDomainFilters;

export type ExceptionDefinitionListResponse = OffsetPage<ExceptionDefinition>;

/** ✅ Query/Response ของ Assignment list (ถ้ามีหน้ารายการผู้ได้รับสิทธิ์) */
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
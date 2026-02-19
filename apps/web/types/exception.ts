import type { OffsetPage, OffsetPaginationParams, Searchable } from "./common";

export type PolicyStatus = "Active" | "Inactive";
export type RiskLevel = "Low" | "Medium" | "High";

/** โดเมนของ ExceptionDefinition (ยังไม่มี id) */
export interface ExceptionDefinition {
  exception_id: string; // เช่น "17" (string รองรับ bigint)
  name: string;
  status: PolicyStatus;
  risk: RiskLevel; // ใช้ชื่อ 'risk' (ไม่ใช่ risk_level)
  createdAt: string; // camelCase
  lastUpdated?: string | null;
  description?: string;
  totalAssignments?: number;
}

/** ใช้สำหรับตาราง */
export type RowBase = { id: string };
export type ExceptionDefinitionRow = ExceptionDefinition & RowBase;

/** ฟิลเตอร์หน้า Inventory */
export type ExceptionDomainFilters = {
  search?: string;
  status?: PolicyStatus;
  owner?: string;
};

/** ฟิลเตอร์แบบ UI (ใช้ใน FilterBar) */
export type ExceptionFilterValues = {
  status?: PolicyStatus;
  search?: string;
};

/** แบบฟอร์มแก้ไข */
export type ExceptionEditValues = {
  name: string;
  status: PolicyStatus;
  risk: RiskLevel;
  createdAt: string;
  lastUpdated?: string | null;
  reviewAt?: string | null;
  notes?: string;
};

/** Query/Response ของ Definition list (สำหรับ service/hook) */
export type ExceptionDefinitionListQuery = OffsetPaginationParams &
  Searchable &
  ExceptionDomainFilters;

/** ✅ เปลี่ยนให้ items เป็น Row[] */
export type ExceptionDefinitionListResponse =
  OffsetPage<ExceptionDefinitionRow>;

/** (ที่เหลือของไฟล์คงเดิม) */
export type ExceptionAssignment = {
  assignment_id: string;
  definitionId: string;
  employeeId: string;
  employeeName?: string | null;
  department?: string | null;
  assignedBy?: string | null;
  assignedAt?: string | null;
  expiresAt?: string | null;
  status?: "Active" | "Pending" | "Revoked";
  notes?: string | null;
};

export type ExceptionAssignmentRow = ExceptionAssignment & RowBase;

export type ExceptionAssignmentListQuery = OffsetPaginationParams &
  Searchable & {
    definitionId?: string;
    status?: "Active" | "Pending" | "Expired";
    department?: string;
  };

export type ExceptionAssignmentListResponse =
  OffsetPage<ExceptionAssignmentRow>;

/** ... ส่วน Request types ตามไฟล์เดิม ... */

/**
 * ExceptionDefinition: รายการ "นโยบายยกเว้น" ในระบบ (ระดับ Catalog)
 */

export interface ExceptionDefinition {
  exception_id: string; // เช่น "17" (เก็บเป็น string รองรับ bigint)
  name: string;
  status: PolicyStatus;
  risk: RiskLevel; // ใน type นี้คุณใช้ชื่อ 'risk' (ไม่ใช่ risk_level)
  createdAt: string; // คุณ map เป็น camelCase แล้ว
  lastUpdated?: string | null;
  description?: string;
  totalAssignments?: number;
}

/** ✅ Canonical: Payload/Result สำหรับ Assign แบบ bulk */
export type AssignExceptionsToEmployeesPayload = {
  employeeIds: string[]; // กลุ่มพนักงาน
  definitionIds: string[]; // ข้อยกเว้นหลายรายการ
  effectiveDate?: string; // YYYY-MM-DD
  expiresAt?: string | null; // (ถ้ามี)
  notes?: string;
};

export type AssignExceptionsToEmployeesResult = {
  ok: boolean;
  assignedCount: number; // จำนวนพนักงานที่ได้รับมอบหมาย
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
  pageIndex: number; // 0-based
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

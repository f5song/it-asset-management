// types/exception.ts

/** สถานะของ "นโยบายข้อยกเว้น" (Policy-level) */
export type PolicyStatus = 'Active' | 'Inactive' | 'Deprecated' | 'Archived';

export type ExceptionCategory =
  | 'AI'
  | 'USBDrive'
  | 'MessagingApp'
  | 'ADPasswordPolicy';

export type RiskLevel = 'Low' | 'Medium' | 'High';

/**
 * ExceptionDefinition: รายการ "นโยบายยกเว้น" ในระบบ (ระดับ Catalog)
 */
export interface ExceptionDefinition {
  id: string;                    // EXC-001
  name: string;                  // เช่น "Allow LINE on PC" / "Allow USB storage"
  category: ExceptionCategory;   // AI | USBDrive | MessagingApp | ADPasswordPolicy
  status: PolicyStatus;          // Active | Inactive | Deprecated | Archived
  risk?: RiskLevel;
  owner?: string;

  // เวลา/รอบทบทวนของนโยบาย
  createdAt: string;             // ISO
  lastUpdated?: string | null;   // ISO
  reviewAt?: string | null;      // ISO
  notes?: string;

  // สถิติการมอบหมาย (สำหรับ UI)
  activeAssignments?: number;    // จำนวนที่ Active
  totalAssignments?: number;     // รวมทั้งหมด
}

/**
 * Assignment (User-only): ใครได้รับ exception definition นี้บ้าง
 */
export type ExceptionAssignmentRow = {
  id: string;                      // mapping id หรือ userId
  definitionId: string;            // FK -> ExceptionDefinition.id
  employeeId: string;                // ผู้ใช้ที่ได้รับสิทธิ์
  employeeName?: string | null;
  department?: string | null;
  assignedBy?: string | null;
  assignedAt?: string | null;      // ISO
  expiresAt?: string | null;       // ISO
  status?: 'Active' | 'Pending' | 'Expired' | 'Revoked' | 'Unknown';
  notes?: string | null;
};

/** ฟิลเตอร์หน้า Inventory (Definition-level) */
export type ExceptionDomainFilters = {
  searchText?: string;
  status?: PolicyStatus;
  category?: ExceptionCategory;
  owner?: string;
};

/** ฟิลเตอร์แบบ simple (ใช้ใน FilterBar) */
export type ExceptionFilterValues = {
  status?: PolicyStatus;          // map -> status
  type?: ExceptionCategory;       // map -> category
  searchText?: string;            // keyword
  q?: string;                     // alias ของ searchText
};

/** สำหรับแบบฟอร์ม Edit ของ Definition (ไม่ใช่คำขอ) */
export type ExceptionEditValues = {
  name: string;
  category: ExceptionCategory;
  status: PolicyStatus;
  owner: string;
  risk: RiskLevel;
  createdAt: string;              // datetime-local หรือ ISO
  lastUpdated?: string | null;    // datetime-local หรือ ISO
  reviewAt?: string | null;       // datetime-local หรือ ISO
  notes: string;
};
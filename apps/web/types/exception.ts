import { FilterValues } from "./common";

export type ExceptionGroup = 'Approved' | 'Pending' | 'Expired' | 'Revoked';
export type ExceptionCategory = 'AI' | 'USBDrive' | 'MessagingApp' | 'ADPasswordPolicy';
export type ExceptionScope = 'User' | 'Device' | 'Group' | 'Tenant';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ExceptionItem {
  id: string;
  name: string;                 // ชื่อข้อยกเว้น เช่น "Allow ChatGPT for Dev Team"
  category: ExceptionCategory;  // ประเภท เช่น AI, USBDrive, MessagingApp, ADPasswordPolicy
  group: ExceptionGroup;        // สถานะ/กลุ่ม เช่น Approved, Pending, Expired, Revoked
  scope: ExceptionScope;        // ขอบเขตผลบังคับ: User/Device/Group/Tenant
  target: string;               // เป้าหมาย เช่น username, deviceId, groupName, "Tenant"
  owner?: string;               // เจ้าของระบบ/ผู้รับผิดชอบ
  requestedBy?: string;         // ผู้ร้องขอข้อยกเว้น
  approvedBy?: string;          // ผู้อนุมัติ
  risk?: RiskLevel;
  createdAt: string;            // ISO string
  expiresAt?: string | null;    // ISO string (ถ้ามีวันหมดอายุ)
  notes?: string;
}

// ฟิลเตอร์ฝั่งโดเมน/หน้า
export type ExceptionDomainFilters = {
  searchText?: string;                                   // keyword search
  group?: ExceptionGroup;                       // Approved | Pending | Expired | Revoked
  category?: ExceptionCategory;                 // AI | USBDrive | MessagingApp | ADPasswordPolicy
  scope?: ExceptionScope;                       // User | Device | Group | Tenant
  owner?: string;
  target?: string;
};

export type ExceptionFilterValues = FilterValues<ExceptionGroup, ExceptionCategory>;
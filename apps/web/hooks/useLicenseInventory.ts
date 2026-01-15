
'use client';

import { useMemo, useState } from 'react';
import { LicenseItem, LicenseStatus, LicenseType } from '../types';

/** ฟิลเตอร์สำหรับหน้า License Inventory (โครงสร้างคล้าย Software) */
export interface LicenseFiltersUI {
  manufacturer: string;        // เช่น 'All manufacturer' หรือชื่อ manufacturer จริง
  licenseType: string;   // เช่น 'All License Type' หรือค่า LicenseType
  status: string;        // เช่น 'All Status' หรือค่า LicenseStatus
  search: string;        // ค้นหาหลายช่อง
}

/** ----------------------------
 * 1) ตัวอย่างข้อมูลชุดเล็ก (base) สำหรับขยายเป็นจำนวนมาก
 * ---------------------------- */
const baseLicenses: Omit<LicenseItem, 'id'>[] = [
  {
    softwareName: 'Microsoft Office 365',
    compliance: 'Compliant',
    manufacturer: 'Microsoft',
    licenseType: LicenseType.Subscription,
    total: 120,
    inUse: 98,
    available: 120 - 98,
    expiryDate: '2025-11-11',
    status: LicenseStatus.Active,
  },
  {
    softwareName: 'Adobe Photoshop',
    compliance: 'Compliant',
    manufacturer: 'Adobe',
    licenseType: LicenseType.PerUser,
    total: 80,
    inUse: 80,
    available: 0,
    expiryDate: '2025-10-10',
    status: LicenseStatus.Expired,
  },
  {
    softwareName: 'AutoCAD',
    compliance: 'Compliant',
    manufacturer: 'Autodesk',
    licenseType: LicenseType.PerDevice,
    total: 50,
    inUse: 45,
    available: 50 - 45,
    expiryDate: '2025-02-05',
    status: LicenseStatus.Pending,
  },
  {
    softwareName: 'LINE Works',
    compliance: 'Non-compliant',
    manufacturer: 'LINE Corp',
    licenseType: LicenseType.Subscription,
    total: 200,
    inUse: 176,
    available: 200 - 176,
    expiryDate: '2025-09-02',
    status: LicenseStatus.Active,
  },
  {
    softwareName: 'Windows Server CAL',
    compliance: 'Non-compliant',
    manufacturer: 'Microsoft',
    licenseType: LicenseType.PerUser,
    total: 300,
    inUse: 289,
    available: 300 - 289,
    expiryDate: '2025-12-15',
    status: LicenseStatus.Active,
  },
  {
    softwareName: 'Adobe Acrobat DC',
    compliance: 'Non-compliant',
    manufacturer: 'Adobe',
    licenseType: LicenseType.Subscription,
    total: 150,
    inUse: 150,
    available: 0,
    expiryDate: '2024-10-10',
    status: LicenseStatus.Expired,
  },
  {
    softwareName: '3ds Max',
    compliance: 'Non-compliant',
    manufacturer: 'Autodesk',
    licenseType: LicenseType.PerDevice,
    total: 60,
    inUse: 52,
    available: 60 - 52,
    expiryDate: '2024-12-01',
    status: LicenseStatus.Active,
  },
  {
    softwareName: 'Visio',
    compliance: 'Non-compliant',
    manufacturer: 'Microsoft',
    licenseType: LicenseType.Perpetual,
    total: 40,
    inUse: 12,
    available: 40 - 12,
    expiryDate: '2026-06-30',
    status: LicenseStatus.Active,
  },
];

/** ----------------------------
 * 2) ขยายชุดข้อมูลให้มีจำนวนมาก เพื่อทดสอบ pagination/filters
 * ---------------------------- */
function expandLicenseDataset(targetCount = 1250): LicenseItem[] {
  const arr: LicenseItem[] = [];
  let id = 1;
  while (arr.length < targetCount) {
    for (const b of baseLicenses) {
      if (arr.length >= targetCount) break;
      // ปรับเล็กน้อยให้ดูหลากหลาย เช่น เพิ่ม/ลด inUse
      const jitter = (id % 5) - 2; // -2..+2
      const total = b.total;
      const inUse = Math.max(0, Math.min(total, b.inUse + jitter));
      const available = Math.max(0, total - inUse);

      arr.push({
        id: `LIC-${id++}`,
        softwareName: b.softwareName,
        compliance: b.compliance,
        manufacturer: b.manufacturer,
        licenseType: b.licenseType,
        total,
        inUse,
        available,
        expiryDate: b.expiryDate,
        status: b.status,
      });
    }
  }
  return arr;
}

const ALL_LICENSES = expandLicenseDataset();

/** ----------------------------
 * 3) ฮุคหลัก: ฟิลเตอร์ + options + ชุดข้อมูลที่ผ่านการกรอง
 * ---------------------------- */
export function useLicenseInventory(pageSize = 10) {
  const [filters, setFilters] = useState<LicenseFiltersUI>({
    manufacturer: 'All manufacturer',
    licenseType: 'All License Type',
    status: 'All Status',
    search: '',
  });

  const setFilter = (patch: Partial<LicenseFiltersUI>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  // กรองข้อมูลตามฟิลเตอร์ (เช่นเดียวกับ useSoftwareInventory)
  const filtered = useMemo(() => {
    let data = [...ALL_LICENSES];

    if (filters.manufacturer !== 'All manufacturer') {
      data = data.filter((i) => i.manufacturer === filters.manufacturer);
    }
    if (filters.licenseType !== 'All License Type') {
      data = data.filter((i) => String(i.licenseType) === filters.licenseType);
    }
    if (filters.status !== 'All Status') {
      data = data.filter((i) => String(i.status) === filters.status);
    }

    if (filters.search.trim().length > 0) {
      const s = filters.search.toLowerCase();
      data = data.filter(
        (i) =>
          i.softwareName.toLowerCase().includes(s) ||
          i.manufacturer.toLowerCase().includes(s) ||
          String(i.licenseType).toLowerCase().includes(s) ||
          String(i.status).toLowerCase().includes(s)
      );
    }

    return data;
  }, [filters]);

  // สร้าง options จากข้อมูลทั้งหมด (unique values)
  const manufacturerOptions = Array.from(new Set(ALL_LICENSES.map((i) => i.manufacturer)));
  const licenseTypeOptions = Array.from(
    new Set(ALL_LICENSES.map((i) => String(i.licenseType)))
  );
  const statusOptions = Array.from(new Set(ALL_LICENSES.map((i) => String(i.status))));

  return {
    filters,           // ฟิลเตอร์ UI (string-based เหมือนฝั่ง software)
    setFilter,         // setter แบบ patch
    rows: filtered,    // แถวที่ผ่านการกรอง
    pageSize,
    manufacturerOptions,     // สำหรับ dropdown manufacturer
    licenseTypeOptions,// สำหรับ dropdown license type
    statusOptions,     // สำหรับ dropdown status
    total: filtered.length,
  };
}

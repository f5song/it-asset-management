import { LicenseItem, LicenseStatus, LicenseType } from "../types";



/**
 * Mock รายการ License (สไตล์เดียวกับ mock ของฝั่ง Software)
 * - ใช้รูปแบบวันที่ "DD-MM-YYYY" ตามตัวอย่างเดิม
 * - ค่าตัวอย่าง realistic สำหรับทดสอบ UI/ฟิลเตอร์/เพจรายละเอียด
 */
export const MOCK_LICENSES: LicenseItem[] = [
  {
    id: 'LIC-1',
    compliance: 'Compliant',
    softwareName: 'Microsoft Office 365',
    manufacturer: 'Microsoft',
    licenseType: LicenseType.Subscription,
    total: 120,
    inUse: 97,
    available: 23,
    expiryDate: '11-11-2025',
    status: LicenseStatus.Active,
  },
  {
    id: 'LIC-2',
    softwareName: 'Adobe Photoshop',
    compliance: 'Compliant',
    manufacturer: 'Adobe',
    licenseType: LicenseType.PerUser,
    total: 80,
    inUse: 80,
    available: 0,
    expiryDate: '10-10-2025',
    status: LicenseStatus.Expired,
  },
  {
    id: 'LIC-3',
    softwareName: 'LINE Works',
    compliance: 'Compliant',
    manufacturer: 'LINE Corp',
    licenseType: LicenseType.Subscription,
    total: 200,
    inUse: 178,
    available: 22,
    expiryDate: '02-09-2025',
    status: LicenseStatus.Active,
  },
  {
    id: 'LIC-4',
    softwareName: 'AutoCAD',
    compliance: 'Compliant',
    manufacturer: 'Autodesk',
    licenseType: LicenseType.PerDevice,
    total: 50,
    inUse: 46,
    available: 4,
    expiryDate: '05-02-2025',
    status: LicenseStatus.Pending,
  },
  {
    id: 'LIC-5',
    softwareName: 'Windows Server CAL',
    compliance: 'Compliant',
    manufacturer: 'Microsoft',
    licenseType: LicenseType.PerUser,
    total: 300,
    inUse: 287,
    available: 13,
    expiryDate: '15-12-2025',
    status: LicenseStatus.Active,
  },
  {
    id: 'LIC-6',
    softwareName: 'Adobe Acrobat DC',
    compliance: 'Non-compliant',
    manufacturer: 'Adobe',
    licenseType: LicenseType.Subscription,
    total: 150,
    inUse: 149,
    available: 1,
    expiryDate: '10-10-2024',
    status: LicenseStatus.Expired,
  },
  {
    id: 'LIC-7',
    softwareName: '3ds Max',
    compliance: 'Non-compliant',
    manufacturer: 'Autodesk',
    licenseType: LicenseType.PerDevice,
    total: 60,
    inUse: 52,
    available: 8,
    expiryDate: '01-12-2024',
    status: LicenseStatus.Active,
  },
  {
    id: 'LIC-8',
    softwareName: 'Visio',
    manufacturer: 'Microsoft',
    compliance: 'Non-compliant',
    licenseType: LicenseType.Perpetual,
    total: 40,
    inUse: 12,
    available: 28,
    expiryDate: '30-06-2026',
    status: LicenseStatus.Active,
  },
  // เพิ่มรายการ 9–12 เพื่อทดสอบสกรอล/เพจ
  {
    id: 'LIC-9',
    softwareName: 'Figma',
    compliance: 'Non-compliant',
    manufacturer: 'Figma Inc.',
    licenseType: LicenseType.Subscription,
    total: 100,
    inUse: 84,
    available: 16,
    expiryDate: '15-03-2025',
    status: LicenseStatus.Pending,
  },
  {
    id: 'LIC-10',
    softwareName: 'Slack',
    compliance: 'Non-compliant',
    manufacturer: 'Slack',
    licenseType: LicenseType.Subscription,
    total: 250,
    inUse: 230,
    available: 20,
    expiryDate: '11-11-2025',
    status: LicenseStatus.Active,
  },
  {
    id: 'LIC-11',
    softwareName: 'VS Code',
    compliance: 'Pending',
    manufacturer: 'Microsoft',
    licenseType: LicenseType.PerUser,
    total: 500,
    inUse: 480,
    available: 20,
    expiryDate: '01-01-2025',
    status: LicenseStatus.Active,
  },
  {
    id: 'LIC-12',
    softwareName: 'Adobe Illustrator',
    compliance: 'Pending',
    manufacturer: 'Adobe',
    licenseType: LicenseType.PerUser,
    total: 120,
    inUse: 115,
    available: 5,
    expiryDate: '20-08-2025',
    status: LicenseStatus.Active,
  },
];

/** ดึง License ตาม id (mock) */
export async function getLicenseById(id: string): Promise<LicenseItem | null> {
  return MOCK_LICENSES.find((it) => it.id === id) ?? null;
}

/** ดึง License ทั้งหมด (mock) */
export async function getAllLicenses(): Promise<LicenseItem[]> {
  return MOCK_LICENSES;
}

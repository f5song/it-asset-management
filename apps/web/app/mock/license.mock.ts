import { LicenseActivity, LicenseItem, LicenseModel, LicenseStatus } from "types";




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
    licenseModel: LicenseModel.Subscription,
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
    licenseModel: LicenseModel["Per-User"],
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
    licenseModel: LicenseModel.Subscription,
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
    licenseModel: LicenseModel["Per-Device"],
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
    licenseModel: LicenseModel["Per-User"],
    total: 300,
    inUse: 287,
    available: 13,
    expiryDate: '15-12-2025',
    status: LicenseStatus.Active,
  },
  {
    id: 'LIC-6',
    softwareName: 'Adobe Acrobat DC',
    compliance: 'Non-Compliant',
    manufacturer: 'Adobe',
    licenseModel: LicenseModel.Subscription,
    total: 150,
    inUse: 149,
    available: 1,
    expiryDate: '10-10-2024',
    status: LicenseStatus.Expired,
  },
  {
    id: 'LIC-7',
    softwareName: '3ds Max',
    compliance: 'Non-Compliant',
    manufacturer: 'Autodesk',
    licenseModel: LicenseModel["Per-Device"],
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
    compliance: 'Non-Compliant',
    licenseModel: LicenseModel.Perpetual,
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
    compliance: 'Non-Compliant',
    manufacturer: 'Figma Inc.',
    licenseModel: LicenseModel.Subscription,
    total: 100,
    inUse: 84,
    available: 16,
    expiryDate: '15-03-2025',
    status: LicenseStatus.Pending,
  },
  {
    id: 'LIC-10',
    softwareName: 'Slack',
    compliance: 'Non-Compliant',
    manufacturer: 'Slack',
    licenseModel: LicenseModel.Subscription,
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
    licenseModel: LicenseModel["Per-User"],
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
    licenseModel: LicenseModel["Per-User"],
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


// ✅ Mock dataset (คละ string และ Date ให้เห็นเคสทั้งสองแบบ)
export const LicenseActivityData: LicenseActivity[] = [
  { date: "2026-01-13T09:15:00Z", action: "Assign",            software: "Microsoft Office 365", employee: "Anan P." },
  { date: new Date("2026-01-13T11:30:00Z"), action: "Deallocate",        software: "Adobe Photoshop",      employee: "Nicha T." },
  { date: "2026-01-12T15:05:00Z", action: "Request Approved",  software: "AutoCAD LT",            employee: "Chaiwat K." },
  { date: new Date("2026-01-12T17:40:00Z"), action: "Request Rejected",  software: "Slack",                employee: "Pimchanok S." },
  { date: "2026-01-11T08:55:00Z", action: "Assign",            software: "Visual Studio Pro",     employee: "Supakorn J." },
  { date: new Date("2026-01-11T10:22:00Z"), action: "Assign",            software: "JetBrains IntelliJ",   employee: "Sasithorn R." },
  { date: "2026-01-10T13:10:00Z", action: "Deallocate",        software: "Zoom Pro",              employee: "Kirati C." },
  { date: new Date("2026-01-10T16:45:00Z"), action: "Request Approved",  software: "Microsoft Visio",      employee: "Patcharaporn J." },
  { date: "2026-01-09T09:00:00Z", action: "Assign",            software: "Figma",                employee: "Varis R." },
  { date: new Date("2026-01-09T11:20:00Z"), action: "Request Rejected",  software: "Adobe Illustrator",    employee: "Benjaporn K." },
  { date: "2026-01-08T14:35:00Z", action: "Assign",            software: "Tableau Desktop",       employee: "Pattarapon T." },
  { date: new Date("2026-01-08T18:05:00Z"), action: "Deallocate",        software: "Postman",              employee: "Jirapat M." },
  { date: "2026-01-07T10:50:00Z", action: "Request Approved",  software: "Microsoft Project",     employee: "Napatsorn L." },
  { date: new Date("2026-01-07T15:25:00Z"), action: "Assign",            software: "Notion",               employee: "Kamonchanok W." },
  { date: "2026-01-06T09:45:00Z", action: "Deallocate",        software: "Jira Software",         employee: "Thanakorn P." },
];
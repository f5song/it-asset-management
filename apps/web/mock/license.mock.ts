// src/services/mock/licenses.mock.ts
import {
  LicenseItem,
  LicenseModel,
  LicenseStatus,
  type LicenseActivity,
  type Compliance,
} from "types";

/** ---------- Helpers ---------- */

// "DD-MM-YYYY" -> "YYYY-MM-DD"
const toISO = (ddmmyyyy: string): string => {
  const [dd, mm, yyyy] = ddmmyyyy.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

const perTypeFromModel = (m: LicenseModel): "per_user" | "per_device" => {
  if (m === LicenseModel["Per-User"]) return "per_user";
  if (m === LicenseModel["Per-Device"]) return "per_device";
  // สำหรับ Perpetual/Subscription ไม่มีบอก per-type ชัดเจน → ตั้งค่าเริ่มต้นให้ง่าย
  return "per_user";
};

const consumptionUnitFromPerType = (
  pt: "per_user" | "per_device",
): "perUser" | "perDevice" | "concurrent" =>
  pt === "per_device" ? "perDevice" : "perUser";

const termFromModel = (m: LicenseModel): "subscription" | "perpetual" | "unknown" => {
  if (m === LicenseModel.Subscription) return "subscription";
  if (m === LicenseModel.Perpetual) return "perpetual";
  return "unknown";
};

/** map compliance แบบง่าย: ใช้เฉพาะค่าที่มักจะอยู่ใน Compliance จริงของระบบ */
const asCompliance = (c: string): Compliance => {
  // ปรับ “Active” ออก เพราะไม่ใช่ compliance (มันเป็น status)
  const map: Record<string, Compliance> = {
    Compliant: "Compliant",
    "Non-Compliant": "Non-Compliant",
    Exception: "Exception",
  };
  return (map[c] ?? "Compliant") as Compliance;
};

/** ตัวช่วยสร้าง LicenseItem แบบสั้น */
function mk(
  base: {
    id: string;
    softwareName: string;
    manufacturer: string;
    licenseModel: LicenseModel;
    total: number;
    inUse: number;
    expiry: string; // "DD-MM-YYYY"
    status: LicenseStatus;
    compliance: Compliance | string;
  },
  extra?: Partial<LicenseItem>,
): LicenseItem {
  const perType = perTypeFromModel(base.licenseModel);
  const consumptionUnit = consumptionUnitFromPerType(perType);
  const term = termFromModel(base.licenseModel);

  return {
    id: base.id,
    softwareName: base.softwareName,
    manufacturer: base.manufacturer,

    licenseModel: base.licenseModel,
    perType,
    sku: extra?.sku,
    edition: extra?.edition,
    version: extra?.version,
    consumptionUnit,
    term,

    total: base.total,
    inUse: base.inUse,
    available: Math.max(0, base.total - base.inUse),

    expiryDate: toISO(base.expiry),
    status: base.status,
    contractId: extra?.contractId,
    costCenter: extra?.costCenter,
    purchaseDate: extra?.purchaseDate,
    renewDate: extra?.renewDate,

    compliance: asCompliance(String(base.compliance)),

    createdAt: extra?.createdAt,
    updatedAt: extra?.updatedAt,

    // ค่าบังคับที่ mock ให้แบบง่าย
    cost: extra?.cost ?? 0,
    maintenanceCost: extra?.maintenanceCost ?? 0,
    notes: extra?.notes ?? "",
    licenseKey:
      extra?.licenseKey ??
      `${base.softwareName.replace(/\s+/g, "-").toUpperCase()}-XXXX-XXXX`,
  };
}

/**
 * Mock รายการ License (สอดคล้องกับ LicenseItem 100%)
 */
export const MOCK_LICENSES: LicenseItem[] = [
  mk({
    id: "LIC-1",
    softwareName: "Microsoft Office 365",
    manufacturer: "Microsoft",
    licenseModel: LicenseModel.Subscription,
    total: 120,
    inUse: 97,
    expiry: "11-11-2025",
    status: LicenseStatus.Active,
    compliance: "Compliant",
  }),
  mk({
    id: "LIC-2",
    softwareName: "Adobe Photoshop",
    manufacturer: "Adobe",
    licenseModel: LicenseModel["Per-User"],
    total: 80,
    inUse: 80,
    expiry: "10-10-2025",
    status: LicenseStatus.Expired,
    compliance: "Compliant",
  }),
  mk({
    id: "LIC-3",
    softwareName: "LINE Works",
    manufacturer: "LINE Corp",
    licenseModel: LicenseModel.Subscription,
    total: 200,
    inUse: 178,
    expiry: "02-09-2025",
    status: LicenseStatus.Active,
    compliance: "Compliant",
  }),
  mk({
    id: "LIC-4",
    softwareName: "AutoCAD",
    manufacturer: "Autodesk",
    licenseModel: LicenseModel["Per-Device"],
    total: 50,
    inUse: 46,
    expiry: "05-02-2025",
    status: LicenseStatus.Active,
    compliance: "Compliant",
  }),
  mk({
    id: "LIC-5",
    softwareName: "Windows Server CAL",
    manufacturer: "Microsoft",
    licenseModel: LicenseModel["Per-User"],
    total: 300,
    inUse: 287,
    expiry: "15-12-2025",
    status: LicenseStatus.Active,
    compliance: "Compliant",
  }),
  mk({
    id: "LIC-6",
    softwareName: "Adobe Acrobat DC",
    manufacturer: "Adobe",
    licenseModel: LicenseModel.Subscription,
    total: 150,
    inUse: 149,
    expiry: "10-10-2024",
    status: LicenseStatus.Expired,
    compliance: "Non-Compliant",
  }),
  mk({
    id: "LIC-7",
    softwareName: "3ds Max",
    manufacturer: "Autodesk",
    licenseModel: LicenseModel["Per-Device"],
    total: 60,
    inUse: 52,
    expiry: "01-12-2024",
    status: LicenseStatus.Active,
    compliance: "Non-Compliant",
  }),
  mk({
    id: "LIC-8",
    softwareName: "Visio",
    manufacturer: "Microsoft",
    licenseModel: LicenseModel.Perpetual,
    total: 40,
    inUse: 12,
    expiry: "30-06-2026",
    status: LicenseStatus.Active,
    compliance: "Non-Compliant",
  }),
  mk({
    id: "LIC-9",
    softwareName: "Figma",
    manufacturer: "Figma Inc.",
    licenseModel: LicenseModel.Subscription,
    total: 100,
    inUse: 84,
    expiry: "15-03-2025",
    status: LicenseStatus.Active,
    compliance: "Non-Compliant",
  }),
  mk({
    id: "LIC-10",
    softwareName: "Slack",
    manufacturer: "Slack",
    licenseModel: LicenseModel.Subscription,
    total: 250,
    inUse: 230,
    expiry: "11-11-2025",
    status: LicenseStatus.Active,
    compliance: "Non-Compliant",
  }),
  mk({
    id: "LIC-11",
    softwareName: "VS Code",
    manufacturer: "Microsoft",
    licenseModel: LicenseModel["Per-User"],
    total: 500,
    inUse: 480,
    expiry: "01-01-2025",
    status: LicenseStatus.Active,
    // เดิม mock มี 'Active' (ไม่ใช่ Compliance) → ใช้ 'Compliant'
    compliance: "Compliant",
  }),
  mk({
    id: "LIC-12",
    softwareName: "Adobe Illustrator",
    manufacturer: "Adobe",
    licenseModel: LicenseModel["Per-User"],
    total: 120,
    inUse: 115,
    expiry: "20-08-2025",
    status: LicenseStatus.Active,
    compliance: "Compliant",
  }),
];

/** ดึง License ตาม id (mock) */
export async function getLicenseById(id: string): Promise<LicenseItem | null> {
  return MOCK_LICENSES.find((it) => it.id === id) ?? null;
}

/** ดึง License ทั้งหมด (mock) */
export async function getAllLicenses(): Promise<LicenseItem[]> {
  return MOCK_LICENSES;
}

/** ---------- Mock dataset ของ Activity (คละ string/Date) ---------- */
export const LicenseActivityData: LicenseActivity[] = [
  { date: "2026-01-13T09:15:00Z", action: "Assign",            software: "Microsoft Office 365", employee: "Anan P." },
  { date: new Date("2026-01-13T11:30:00Z"), action: "Deallocate",        software: "Adobe Photoshop",      employee: "Nicha T." },
  { date: "2026-01-12T15:05:00Z", action: "Request Approved",  software: "AutoCAD LT",            employee: "Chaiwat K." },
  { date: new Date("2026-01-12T17:40:00Z"), action: "Request Rejected",  software: "Slack",                employee: "Pimchanok S." },
  { date: "2026-01-11T08:55:00Z", action: "Assign",            software: "Visual Studio Pro",     employee: "Supakorn J." },
  { date: new Date("2026-01-11T10:22:00Z"), action: "Assign",            software: "JetBrains IntelliJ",   employee: "Sasithorn R." },
  { date: "2026-01-10T13:10:00Z", action: "Deallocate",        software: "Zoom Pro",              employee: "Kirati C." },
  { date: new Date("2026-01-10T16:45:00Z"), action: "Request Approved",  software: "Microsoft Visio",      employee: "Patcharaporn J." },
  { date: "2026-01-09T09:00:00Z", action: "Assign",            software: "Figma",                 employee: "Varis R." },
  { date: new Date("2026-01-09T11:20:00Z"), action: "Request Rejected",  software: "Adobe Illustrator",    employee: "Benjaporn K." },
  { date: "2026-01-08T14:35:00Z", action: "Assign",            software: "Tableau Desktop",       employee: "Pattarapon T." },
  { date: new Date("2026-01-08T18:05:00Z"), action: "Deallocate",        software: "Postman",              employee: "Jirapat M." },
  { date: "2026-01-07T10:50:00Z", action: "Request Approved",  software: "Microsoft Project",     employee: "Napatsorn L." },
  { date: new Date("2026-01-07T15:25:00Z"), action: "Assign",            software: "Notion",               employee: "Kamonchanok W." },
  { date: "2026-01-06T09:45:00Z", action: "Deallocate",        software: "Jira Software",         employee: "Thanakorn P." },
];
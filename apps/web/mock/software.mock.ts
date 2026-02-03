// src/mocks/data/software.mock.ts

import type {
  SoftwareItem,
  SoftwareStatus,
  Compliance,
  SoftwareType,
  ClientServer,
  LicenseModel, // 👈 ใช้ import type
} from "types";

/**
 * ชุดค่าคงที่แบบ literal ที่ตรงกับ type ที่ประกาศไว้
 * ใช้ readonly tuple + satisfies ให้ TS ตรวจว่าถูกกับ union จริง ๆ
 */
const MANUFACTURERS = ["Microsoft", "Adobe", "Autodesk", "Google"] as const;

const STATUSES = ["Active", "Expired", "Expiring"] as const satisfies readonly SoftwareStatus[];

const SOFTWARE_TYPES = ["Standard", "Special", "Exception"] as const satisfies readonly SoftwareType[];

const COMPLIANCE = ["Compliant", "Non-Compliant"] as const satisfies readonly Compliance[];

const CLIENT_SERVER = ["Client", "Server"] as const satisfies readonly ClientServer[];

// ⛔️ ห้ามใช้ Object.values(LicenseModel) เพราะ LicenseModel เป็น type (ไม่มีค่า)
// ✅ ประกาศค่าคงที่เองให้ TS ตรวจว่าเข้ากับ LicenseModel
const LICENSE_MODELS = [
  "Per-User",
  "Per-Device",
  "Perpetual",
  "Subscription",
] as const satisfies readonly LicenseModel[];

/**
 * สร้าง mock 123 รายการให้ตรง type SoftwareItem
 */
export const MOCK_ITEMS: SoftwareItem[] = Array.from({ length: 123 }).map((_, i) => {
  const idx = i + 1;

  const manufacturer = MANUFACTURERS[i % MANUFACTURERS.length];
  const status = STATUSES[i % STATUSES.length];
  const softwareType = SOFTWARE_TYPES[i % SOFTWARE_TYPES.length];
  const policyCompliance = COMPLIANCE[i % COMPLIANCE.length];
  const clientServer = CLIENT_SERVER[i % CLIENT_SERVER.length];
  const licenseModel = LICENSE_MODELS[i % LICENSE_MODELS.length];

  // สร้างวันที่หมดอายุรูปแบบ ISO (YYYY-MM-DD)
  const yyyy = 2026;
  const mm = String((idx % 12) + 1).padStart(2, "0");
  const dd = String((idx % 28) + 1).padStart(2, "0");
  const expiryDate = `${yyyy}-${mm}-${dd}`;

  return {
    id: `SW-${idx}`,
    softwareName: `Software ${idx}`,
    manufacturer,
    version: `${Math.floor(1 + (idx % 25))}.${idx % 10}`,
    category: idx % 2 === 0 ? "Productivity" : "Design",
    policyCompliance,
    expiryDate, // string | null | undefined → ให้เป็น string
    status,
    softwareType,
    licenseModel,
    clientServer,
  } satisfies SoftwareItem;
});

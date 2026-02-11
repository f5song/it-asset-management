import type { InstallationRow } from "types";

// ตัวอย่าง mock (ถ้าชนิดใน types กำหนด field เป็น required/optional ให้ตรงกัน)
export const MOCK_INSTALLATIONS_BY_SOFTWARE: InstallationRow[] = [
  {
    id: "sw-ins-1",
    deviceName: "NB-205",
    userName: "Nuttamon Saejin",
    department: "สำนักกิจการและสื่อสารองค์กร",
    version: "2.9.0.3",
    installDate: "2026-09-16",
    lastSeen: "2026-10-11",
    workStation: "almkt-athitay01.workgroup",
  },
  {
    id: "sw-ins-2",
    deviceName: "NB-206",
    userName: "Piyanut Yeunsuk",
    department: "สำนักกิจการและสื่อสารองค์กร",
    version: "2.9.0.3",
    installDate: "2026-09-16",
    lastSeen: "2026-10-11",
    workStation: "almkt-athitay01.workgroup",
  },
  {
    id: "sw-ins-3",
    deviceName: "NB-207",
    userName: "Kodchaporn Teeranatprajak",
    department: "สำนักกิจการและสื่อสารองค์กร",
    version: "2.9.0.3",
    installDate: "2026-09-16",
    lastSeen: "2026-10-11",
    workStation: "almkt-athitay01.workgroup",
  },
];

// ดึงรายการติดตั้งตาม software id (mock: ยังไม่กรอง)
export async function getInstallationsBySoftware(
  softwareId: string,
): Promise<InstallationRow[]> {
  // TODO: mock ให้สมจริงขึ้นโดยผูก softwareId -> รายการ หรือกรองจาก map
  return MOCK_INSTALLATIONS_BY_SOFTWARE;
}

// ประเภทผลลัพธ์ที่ถูกต้อง: ต้องคืน 'arrays'
export type InstallationFilterOptions = {
  users: string[];
  devices: string[];
};

export async function getInstallationFilters(
  softwareId: string,
): Promise<InstallationFilterOptions> {
  const users = Array.from(
    new Set(
      MOCK_INSTALLATIONS_BY_SOFTWARE.map((r) => r.userName).filter(Boolean),
    ),
  ) as string[];

  const devices = Array.from(
    new Set(
      MOCK_INSTALLATIONS_BY_SOFTWARE.map((r) => r.deviceName).filter(Boolean),
    ),
  ) as string[];

  return { users, devices };
}

import type { InstallationRow } from "types";

// ตัวอย่าง mock (ถ้าชนิดใน types กำหนด field เป็น required/optional ให้ตรงกัน)
export const MOCK_INSTALLATIONS_BY_SOFTWARE: InstallationRow[] = [
  { id: "1", deviceName: "LAPTOP-TH-BKK-01", userName: "Puttaraporn Jitpranee" },
  { id: "2", deviceName: "LAPTOP-TH-BKK-02", userName: "Puttaraporn Jitpranee" },
];

// ดึงรายการติดตั้งตาม software id (mock: ยังไม่กรอง)
export async function getInstallationsBySoftware(softwareId: string): Promise<InstallationRow[]> {
  // TODO: mock ให้สมจริงขึ้นโดยผูก softwareId -> รายการ หรือกรองจาก map
  return MOCK_INSTALLATIONS_BY_SOFTWARE;
}

// ประเภทผลลัพธ์ที่ถูกต้อง: ต้องคืน 'arrays'
export type InstallationFilterOptions = {
  users: string[];
  devices: string[];
};

export async function getInstallationFilters(softwareId: string): Promise<InstallationFilterOptions> {
  const users = Array.from(
    new Set(MOCK_INSTALLATIONS_BY_SOFTWARE.map(r => r.userName).filter(Boolean))
  ) as string[];

  const devices = Array.from(
    new Set(MOCK_INSTALLATIONS_BY_SOFTWARE.map(r => r.deviceName).filter(Boolean))
  ) as string[];

  return { users, devices };
}
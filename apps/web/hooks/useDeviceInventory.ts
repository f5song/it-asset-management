import * as React from "react";
import { getDevices } from "services/devices.service.mock";
import type { DeviceItem, DeviceListQuery } from "types/device"; // ใช้ type กลาง

// Query ที่มาจาก controller (TanStack-style หรือของคุณเอง)
type Query = {
  pageIndex: number;                   // 0-based
  pageSize: number;
  sortBy?: string;                     // ชื่อคอลัมน์
  sortOrder?: "asc" | "desc";          // ทิศทาง
};

// ฟิลเตอร์ที่ถูก normalize แล้ว (string ว่าง = ไม่กรอง)
type Filters = {
  deviceGroup?: string;                // "assigned" | "unassigned" | "" (normalize แล้ว)
  deviceType?: string;                 // "laptop" | "desktop" | ... | ""
  os?: string;                         // "windows" | "macos" | ... | ""
  search?: string;                     // คำค้น
};

export function useDeviceInventory(query: Query, filters?: Filters) {
  const [rows, setRows] = React.useState<DeviceItem[]>([]);
  const [totalRows, setTotalRows] = React.useState(0);
  const [isLoading, setLoading] = React.useState(false);
  const [isError, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const ac = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setError(false);
        setErrorMessage(undefined);

        // ✅ map เป็น DeviceListQuery (API ใหม่)
        const q: DeviceListQuery = {
          page: (query.pageIndex ?? 0) + 1,     // 1-based
          pageSize: query.pageSize ?? 10,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          search: filters?.search ?? "",
          deviceGroup: filters?.deviceGroup ?? "",
          deviceType: filters?.deviceType ?? "",
          os: filters?.os ?? "",
        };

        const res = await getDevices(q, ac.signal);

        // ✅ อ่านผลลัพธ์จาก keys ใหม่
        setRows(res.items ?? []);
        setTotalRows(res.totalCount ?? 0);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(true);
        setErrorMessage(e?.message ?? "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    run();
    // ใส่ deps ให้ครอบคลุมทุก key ที่ใช้คำนวน q
    return () => ac.abort();
  }, [
    query.pageIndex,
    query.pageSize,
    query.sortBy,
    query.sortOrder,
    filters?.search,
    filters?.deviceGroup,
    filters?.deviceType,
    filters?.os,
  ]);

  return { rows, totalRows, isLoading, isError, errorMessage };
}

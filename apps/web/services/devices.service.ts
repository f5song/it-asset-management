
// // src/services/devices.service.ts

// import { apiFetch } from "lib/http/fetcher";


// export type DeviceQuery = {
//   page: number; // 1-based
//   pageSize: number;
//   sortBy?: string;
//   sortOrder?: "asc" | "desc";
//   deviceGroup?: string;
//   deviceType?: string;
//   os?: string;
//   search?: string;
// };

// export type DeviceItem = {
//   id: string | number;
//   name: string;
//   type: string;
//   assignedTo?: string;
//   os: string;
//   compliance?: string;
//   lastScan?: string;
// };

// export type Paged<T> = { items: T[]; total: number };

// //   สลับ MOCK/REAL ผ่าน env
// const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
// export async function getDevices(q: DeviceQuery): Promise<Paged<DeviceItem>> {
//   if (USE_MOCK) {
//     const mod = await import("./devices.service.mock");
//     return mod.getDevices(q);
//   }

//   // 🔗 เชื่อม BE จริง (เปลี่ยน base URL ใน fetcher.ts หรือ path ให้เป็นของจริง)
//   const res = await apiFetch<Paged<DeviceItem>>("/devices", {
//     query: {
//       page: q.page,
//       pageSize: q.pageSize,
//       sortBy: q.sortBy,
//       sortOrder: q.sortOrder,
//       deviceGroup: q.deviceGroup || "",
//       deviceType: q.deviceType || "",
//       os: q.os || "",
//       search: q.search || "",
//     },
//   });
//   return res;
// }

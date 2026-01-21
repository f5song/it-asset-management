import { Compliance } from "./software";

// src/types/common.ts
export type Paged<T> = { items: T[]; total: number };
export type DeviceGroup = "Assigned" | "Unassigned";
export type DeviceType = "Laptop" | "Desktop" | "VM" | "Mobile";
// ถ้ามี enum/union สำหรับ OS ก็สามารถประกาศเป็น type ได้
export type DeviceOS = "Windows" | "macOS" | "Linux" | "iOS" | "Android";

export type DeviceFilters = {
  deviceGroup?: DeviceGroup | undefined;
  deviceType?: DeviceType | undefined;
  os?: DeviceOS | string | undefined;
  search: string;
};


// src/types/device.ts
export type DeviceQuery = {
  page: number;       // 1-based
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  deviceGroup?: string;
  deviceType?: string;
  os?: string;
  search?: string;
};

export type DeviceItem = {
  id: string;
  name: string;
  type: string;
  assignedTo?: string;
  os: string;
  compliance?: Compliance;
  lastScan?: string;
};

// ซอฟต์แวร์ที่ "อยู่บนเครื่อง" (สำหรับแท็บ Bundled Software)
export type DeviceBundledSoftware = {
  id: string;                 // software id
  softwareName: string;
  manufacturer: string;
  version: string;
  category: string;
  policyCompliance?: "Compliant" | "Non-Compliant" | "Exception" | "Unknown";
  licenseStatus?: "Licensed" | "Unlicensed" | "Expired" | "Trial" | "Unknown";
  lastScan?: string | null;
};

// Query สำหรับแท็บ Bundled Software
export type DeviceSoftwareQuery = {
  page: number;
  pageSize: number;
  sortBy?: "softwareName" | "manufacturer" | "version" | "category" | "lastScan";
  sortOrder?: "asc" | "desc";
  search?: string;
  manufacturer?: string;
  category?: string;
  compliance?: string;
};

export type DeviceItemsQuery = {
  page: number;                 // 1-based
  limit: number;                // page size
  sortBy?: keyof DeviceItem | string;
  sortOrder?: "asc" | "desc";
  // filters
  searchText?: string;
  deviceGroupFilter?: "assigned" | "unassigned" | ""; // internal value
  deviceTypeFilter?: string;                           // internal value
  osFilter?: string;                                   // internal value
};

export type DeviceItemsResponse = {
  data: DeviceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

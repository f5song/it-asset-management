
// src/services/licenses.service.ts

import { apiFetch } from "lib/http/fetcher";
import type { PagedResponse } from "./licenses.service.mock"; // reuse type
import type { LicensesQuery } from "./licenses.service.mock";
import { LicenseItem } from "types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export async function getLicenseById(id: string): Promise<LicenseItem | null> {
  if (USE_MOCK) {
    const mod = await import("./licenses.service.mock");
    return mod.getLicenseById(id);
  }
  return apiFetch<LicenseItem | null>(`/api/licenses/${id}`);
}

export async function getLicenses(q: LicensesQuery): Promise<PagedResponse<LicenseItem>> {
  if (USE_MOCK) {
    const mod = await import("./licenses.service.mock");
    return mod.getLicenses(q);
  }
  return apiFetch<PagedResponse<LicenseItem>>("/licenses", {
    query: {
      page: q.page,
      pageSize: q.pageSize,
      sortBy: q.sortBy,
      sortOrder: q.sortOrder,
      status: q.status,
      licenseModel: q.licenseModel,
      manufacturer: q.manufacturer,
      search: q.search,
    },
  });
}

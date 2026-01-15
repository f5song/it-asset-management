
// hooks/useLicenseQuery.ts
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { LicenseItem, LicenseStatus, LicenseType } from '../types';
import { LegacySorting } from './useItemsTable';


// --- helpers (ย่อจากเวอร์ชันเต็ม) ---
const toStr = (v: unknown, fallback = '') => (typeof v === 'string' ? v : v != null ? String(v) : fallback);
const toNum = (v: unknown, fallback = 0) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const toLicenseStatus = (v: unknown, fb: LicenseStatus = LicenseStatus.Active): LicenseStatus =>
  typeof v === 'string' && Object.values(LicenseStatus).includes(v as LicenseStatus) ? (v as LicenseStatus) : fb;
const toLicenseType = (v: unknown, fb: LicenseType = LicenseType.Subscription): LicenseType =>
  typeof v === 'string' && Object.values(LicenseType).includes(v as LicenseType) ? (v as LicenseType) : fb;

// --- mapper จาก backend → LicenseItem ---
function mapToLicenseItem(r: any): LicenseItem {
  const id = toStr(r?.id);
  const softwareName = toStr(r?.softwareName ?? r?.name);
  const vendor = toStr(r?.vendor ?? r?.manufacturer);
  const total = toNum(r?.totalLicenses ?? r?.total ?? r?.licenseTotal, 0);
  const inUse = toNum(r?.inUse ?? r?.used ?? r?.consumed, 0);
  const available = toNum(r?.available, Math.max(0, total - inUse));
  const expiryRaw = r?.expiryDate ?? r?.expiration ?? r?.expiresAt ?? '';
  const expiryDate =
    expiryRaw instanceof Date ? expiryRaw.toISOString()
      : typeof expiryRaw === 'number' ? new Date(expiryRaw).toISOString()
      : toStr(expiryRaw, '');
  const licenseType = toLicenseType(r?.licenseType ?? r?.type);
  const status = toLicenseStatus(r?.status);

  return { id, softwareName, vendor, licenseType, total, inUse, available, expiryDate, status };
}

export function useLicenseQuery({
  pagination,
  sorting,
  searchText,
  queryParams,
}: {
  pagination: PaginationState;
  sorting: SortingState | LegacySorting;
  searchText: string;
  queryParams: Record<string, unknown>;
}) {
  // 1) normalize sorting → v8
  const normalizedSorting: SortingState =
    Array.isArray(sorting)
      ? sorting
      : sorting?.sortBy
      ? [{ id: sorting.sortBy!, desc: sorting.sortOrder === 'desc' }]
      : [];

  // 2) (แทนที่ด้วย API จริง)
  const rawRows: any[] = []; // ← ใส่ผลลัพธ์จาก API

  // 3) map เป็น LicenseItem[]
  let rows: LicenseItem[] = rawRows.map(mapToLicenseItem);

  // 4) ใช้ filters จาก queryParams
  const vendor = queryParams.vendor as string | undefined;
  const status = queryParams.status as LicenseStatus | undefined;
  if (vendor) rows = rows.filter((x) => x.vendor === vendor);
  if (status) rows = rows.filter((x) => x.status === status);

  // 5) searchText (ค้นหาหลายช่อง)
  const q = searchText.trim().toLowerCase();
  if (q) {
    rows = rows.filter((x) =>
      [x.softwareName, x.vendor, x.licenseType, x.status]
        .map((v) => String(v).toLowerCase())
        .some((s) => s.includes(q))
    );
  }

  // 6) sort client-side (หรือให้ backend ทำ)
  if (normalizedSorting.length > 0) {
    const { id, desc } = normalizedSorting[0];
    rows = [...rows].sort((a, b) => {
      const av = (a as any)[id];
      const bv = (b as any)[id];
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av ?? '').localeCompare(String(bv ?? ''));
      return desc ? -cmp : cmp;
    });
  }

  // 7) pagination client-side (หรือให้ backend ทำ)
  const totalRows = rows.length;
  const start = pagination.pageIndex * pagination.pageSize;
  const end = start + pagination.pageSize;
  const pageRows = rows.slice(start, end);

  return { rows: pageRows, totalRows, isLoading: false, isError: false, errorMessage: undefined };
}

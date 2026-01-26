
// src/services/itemsService.ts
import { MOCK_ITEMS } from '../../device.mock.ts/software.mock';
import type { ItemsQuery, SoftwareItem } from '../../types';
import type { ItemsResponse } from '../../types/service';

/** normalize keyword */
function normalize(s?: string) {
  return (s ?? '').trim().toLowerCase();
}

/** ✅ ลิสต์คีย์ที่อนุญาตให้ sort (ต้องตรงกับ field ของ SoftwareItem) */
const SOFTWARE_SORT_KEYS = [
  'softwareName',
  'manufacturer',
  'version',
  'category',
  'policyCompliance',
  'expiryDate',
  'status',
  'softwareType',
  'licenseModel',
  'clientServer',
] as const;
type SoftwareSortKey = (typeof SOFTWARE_SORT_KEYS)[number];

function isSoftwareSortKey(id: string | undefined): id is SoftwareSortKey {
  return !!id && (SOFTWARE_SORT_KEYS as readonly string[]).includes(id);
}

/** เปรียบเทียบค่าแบบปลอดภัย (รองรับ null/undefined และ field วันหมดอายุ) */
function compareValues(
  key: SoftwareSortKey,
  a: SoftwareItem,
  b: SoftwareItem,
  dir: 1 | -1
) {
  // จัดการ null/undefined ให้ไปท้าย/ต้นตามทิศทาง
  const va = a[key];
  const vb = b[key];

  // กรณีเป็นวันที่ → เปรียบเทียบด้วย timestamp
  if (key === 'expiryDate') {
    const ta = va ? new Date(va as string).getTime() : Number.NaN;
    const tb = vb ? new Date(vb as string).getTime() : Number.NaN;

    // NaN หมายถึงค่าว่าง → จัดไว้ท้ายเสมอ
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1 * dir; // a ว่าง → a ไปท้าย
    if (Number.isNaN(tb)) return -1 * dir; // b ว่าง → b ไปท้าย
    return (ta - tb) * dir;
  }

  // เปรียบเทียบเป็น string โดยเปิด numeric
  return String(va ?? '')
    .localeCompare(String(vb ?? ''), undefined, { numeric: true, sensitivity: 'base' }) * dir;
}

export async function getItemById(id: string): Promise<SoftwareItem | null> {
  // จำลอง network latency
  await new Promise((res) => setTimeout(res, 150));
  const found = (MOCK_ITEMS as SoftwareItem[]).find((x) => String(x.id) === String(id));
  return found ?? null;
}

/** จำลอง network ด้วย setTimeout */
export async function getItemsStock({
  page,
  limit,
  sortBy,
  sortOrder = 'asc',
  statusFilter,
  typeFilter,
  manufacturerFilter,
  searchText,
}: ItemsQuery): Promise<ItemsResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1) filter (ครบทุกเงื่อนไข)
      const kw = normalize(searchText);

      const filtered = (MOCK_ITEMS as SoftwareItem[]).filter((x) => {
        const statusOk = !statusFilter || x.status === statusFilter;

        // ในตารางคุณใช้ softwareType และ manufacturer
        const typeOk = !typeFilter || x.softwareType === typeFilter;

        const mfOk =
          !manufacturerFilter ||
          normalize(x.manufacturer) === normalize(manufacturerFilter);

        const kwOk =
          !kw ||
          normalize(x.softwareName).includes(kw) ||
          normalize(x.manufacturer).includes(kw) ||
          normalize(x.softwareType).includes(kw);

        return statusOk && typeOk && mfOk && kwOk;
      });

      // 2) sort (optional — แคบ sortBy ให้เป็น SoftwareSortKey ก่อน)
      const dir: 1 | -1 = sortOrder === 'desc' ? -1 : 1;
      const sortKey = isSoftwareSortKey(sortBy) ? sortBy : undefined;

      const sorted = sortKey
        ? [...filtered].sort((a, b) => compareValues(sortKey, a, b, dir))
        : filtered;

      // 3) paginate (1-based page)
      const start = (page - 1) * limit;
      const pageRows = sorted.slice(start, start + limit);

      resolve({
        data: pageRows,
        pagination: {
          page,
          limit,
          total: sorted.length,
          totalPages: Math.ceil(sorted.length / limit),
        },
      });
    }, 500);
  });
}

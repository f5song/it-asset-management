
// src/services/itemsService.ts
import { MOCK_ITEMS, type Item, type ItemStatus } from '../mock/mockSoftware';

export type ItemsResponse = {
  data: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ItemsQuery = {
  page: number;                 // 1-based
  limit: number;
  sortBy?: keyof Item;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: ItemStatus;
};

// จำลอง network ด้วย setTimeout (ไม่ใช้ MSW/axios)
export async function getItemsStock({
  page,
  limit,
  sortBy,
  sortOrder = 'asc',
  statusFilter,
}: ItemsQuery): Promise<ItemsResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1) filter
      const filtered = statusFilter
        ? MOCK_ITEMS.filter((x) => x.status === statusFilter)
        : MOCK_ITEMS;

      // 2) sort (optional)
      const dir = sortOrder === 'desc' ? -1 : 1;
      const sorted = sortBy
        ? [...filtered].sort((a, b) => {
            const va = a[sortBy];
            const vb = b[sortBy];
            return String(va).localeCompare(String(vb)) * dir;
          })
        : filtered;

      // 3) paginate
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
    }, 500); // หน่วง 0.5s จำลอง network latency
  });
}

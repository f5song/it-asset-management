
// // src/services/software.service.ts
// import { apiFetch } from 'lib/http/fetcher';
// import { ItemsQuery, ItemsResponse } from 'types';

// import type { SoftwareItem } from 'types/software';

// const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// export async function getItemById(id: string): Promise<SoftwareItem | null> {
//   if (USE_MOCK) {
//     const mod = await import('./software.service.mock');
//     return mod.getItemById(id);
//   }
//   // ✅ internal API (Next.js route) — ปลอดภัยจาก Invalid URL
//   return apiFetch<SoftwareItem | null>(`/api/software/${id}`);

//   // หรือถ้าเป็น external API:
//   // return apiFetch<SoftwareItem | null>(`/software/${id}`, {A
//   //   baseUrl: process.env.NEXT_PUBLIC_API_URL,
//   // });
// }

// export async function getItemsStock(q: ItemsQuery): Promise<ItemsResponse> {
//   if (USE_MOCK) {
//     const mod = await import('./software.service.mock');
//     return mod.getItemsStock(q);
//   }

//   // ✅ ถ้า BE จริงยังส่งรูปแบบเก่า { items, total }:
//   // เราจะแปลงให้เป็น ItemsResponse ใหม่ที่ layer นี้
//   const raw = await apiFetch<{ items: SoftwareItem[]; total: number }>(
//     `/api/software`,  // internal API
//     {
//       query: {
//         page: q.page,
//         pageSize: q.limit,
//         sortBy: q.sortBy,
//         sortOrder: q.sortOrder,
//         status: q.statusFilter,
//         type: q.typeFilter,
//         manufacturer: q.manufacturerFilter,
//         search: q.search,
//       },
//     }
//   );

//   const total = raw?.total ?? 0;
//   const limit = q.limit;
//   const page = q.page;
//   const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

//   return {
//     data: raw?.items ?? [],
//     pagination: {
//       page,
//       limit,
//       total,
//       totalPages,
//     },
//   };
// }

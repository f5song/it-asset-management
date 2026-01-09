import { MOCK_ITEMS } from "@/mock/mockSoftware";
import { ItemsQuery, SoftwareItem } from "@/types";
import { ItemsResponse } from "@/types/service";

function normalize(s?: string) {
  return (s ?? "").trim().toLowerCase();
}

export async function getItemById(id: string): Promise<SoftwareItem | null> {
  await new Promise((res) => setTimeout(res, 150));
  const found = (MOCK_ITEMS as SoftwareItem[]).find((x) => String(x.id) === String(id));
  return found ?? null;
}

// จำลอง network ด้วย setTimeout (ไม่ใช้ MSW/axios)
export async function getItemsStock({
  page,
  limit,
  sortBy,
  sortOrder = "asc",
  statusFilter,
  typeFilter,
  manufacturerFilter,
  searchText,
}: ItemsQuery): Promise<ItemsResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1) filter (ครบทุกเงื่อนไข)
      const kw = normalize(searchText);

      const filtered = MOCK_ITEMS.filter((x) => {
        const statusOk = !statusFilter || x.status === statusFilter;

        // NOTE: ตรวจชื่อฟิลด์ให้ตรงกับ Item ของคุณ
        // ในตารางของคุณมีคอลัมน์ 'softwareType' และ 'manufacturer'
        const typeOk = !typeFilter || x.softwareType === typeFilter;

        // กรณีตัวพิมพ์/ช่องว่างต่างกัน → normalize ทั้งสองฝั่ง
        const mfOk =
          !manufacturerFilter ||
          normalize(x.manufacturer) === normalize(manufacturerFilter);

        // keyword match ชื่อ/ผู้ผลิต/ประเภท
        const kwOk =
          !kw ||
          normalize(x.softwareName).includes(kw) ||
          normalize(x.manufacturer).includes(kw) ||
          normalize(x.softwareType).includes(kw);

        return statusOk && typeOk && mfOk && kwOk;
      });

      // 2) sort (optional)
      const dir = sortOrder === "desc" ? -1 : 1;
      const sorted = sortBy
        ? [...filtered].sort((a, b) => {
            const va = a[sortBy];
            const vb = b[sortBy];
            return String(va).localeCompare(String(vb), undefined, {
              numeric: true,
              sensitivity: "base",
            }) * dir;
          })
        : filtered;

      // 3) paginate (1-based page)
      const start = (page - 1) * limit;
      const pageRows = sorted.slice(start, start + limit);

      resolve({
        data: pageRows,
        pagination: {
          page,
          limit,
          total: sorted.length, // รวมหลังกรอง
          totalPages: Math.ceil(sorted.length / limit),
        },
      });
    }, 500); // หน่วง 0.5s จำลอง network latency
  });
}

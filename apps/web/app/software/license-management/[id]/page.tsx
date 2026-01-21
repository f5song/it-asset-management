
// app/software/license-management/[id]/page.tsx
import BackButton from "components/ui/BackButton";
import { PageHeader } from "components/ui/PageHeader";
import { getAssignedTo, getAssignedToFilters } from "mock/assigned.mock";
import { getHistoryBySoftware } from "mock/history.mock";
import { notFound } from "next/navigation";
import { getLicenseById } from "services/licenses.service.mock";
import LicenseDetail from "./LicenseDetail";


type PageProps = { params: { id: string } };

// ถ้าต้องการไม่แคช ให้เปิดหนึ่งในนี้:
// export const dynamic = "force-dynamic";
// export const revalidate = 0;

export default async function LicenseDetailPage({ params }: PageProps) {
  const { id } = await params;

  // 1) โหลดข้อมูลหลัก (license)
  const license = await getLicenseById(id);
  if (!license) {
    return notFound();
  }

  // 2) โหลดข้อมูลอื่น ๆ แบบขนาน: assigned (installations), filters (users/devices), history
  const [assigned, assignedFilters, history] = await Promise.all([
    getAssignedTo(id),
    getAssignedToFilters(id),
    getHistoryBySoftware(id),
  ]);

  // 3) สร้าง breadcrumbs ให้ตรงกับเส้นทาง list (/software/license-management)
  const breadcrumbs = [
    { label: "Software Inventory", href: "/software/inventory" },
    { label: "License Management", href: "/software/license-management" },
    { label: license.softwareName, href: `/software/license-management/${id}` },
  ];

  // 4) ค่านับรวม (ถ้า API ให้มาก็ใช้ของจริง, ถ้าไม่ก็ derive จาก assigned)
  const total =
    typeof license.total === "number"
      ? license.total
      : Array.isArray(assigned)
      ? assigned.flat().length
      : 0;

  return (
    <div className="p-2">
      <BackButton />
      <PageHeader title={license.softwareName} breadcrumbs={breadcrumbs} />
      <LicenseDetail
        item={license}
        installations={assigned}     // ถ้าเป็น Array<Array<...>> ให้จัดการ flatten/map ต่อใน ClientDetail
        history={history}
        total={total}
      />
    </div>
  );
}

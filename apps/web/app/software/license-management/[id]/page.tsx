
import BackButton from "components/ui/BackButton";
import { PageHeader } from "components/ui/PageHeader";
import { getAssignedTo, getAssignedToFilters } from "mock/assigned.mock";
import { getHistoryBySoftware } from "mock/history.mock";
import { notFound } from "next/navigation";
import { getLicenseById } from "services/licenses.service.mock";
import LicenseDetail from "./LicenseDetail";

type PageProps = { params: { id: string } };

// ถ้าต้องการไม่แคช:
// export const dynamic = "force-dynamic";
// export const revalidate = 0;

export default async function LicenseDetailPage({ params }: PageProps) {
  // ❌ เดิม: const { id } = await params;
  // ✅ params เป็น sync object
  const { id } = await params;

  // 1) โหลดข้อมูลหลัก (license)
  const license = await getLicenseById(id);
  if (!license) {
    return notFound();
  }

  // 2) โหลดข้อมูลอื่น ๆ แบบขนาน
  const [assigned, _assignedFilters, history] = await Promise.all([
    getAssignedTo(id),           // อาจเป็น Array หรือ Array<Array<...>>
    getAssignedToFilters(id),    // ตอนนี้ยังไม่ใช้ แต่เก็บไว้เพื่ออนาคต
    getHistoryBySoftware(id),
  ]);

  // 3) แปลง assigned ให้เป็น flat array ของ InstallationRow
  const installations = Array.isArray(assigned) && Array.isArray(assigned[0])
    ? (assigned as any[]).flat()
    : (assigned as any[]);

  // 4) breadcrumbs ของ License
  const breadcrumbs = [
    { label: "Software Inventory", href: "/software/inventory" },
    { label: "License Management", href: "/software/license-management" },
    { label: license.softwareName, href: `/software/license-management/${id}` },
  ];

  return (
    <div className="p-2">
      <BackButton />
      <LicenseDetail
        item={license}
        installations={installations}
        history={history}
        breadcrumb={breadcrumbs}
      />
    </div>
  );
}


// app/software/license/[id]/page.tsx
import { notFound } from "next/navigation";
import { PageHeader } from "../../../../components/ui/PageHeader";
import BackButton from "../../../../components/ui/BackButton";
import ClientDetail from "./ClientDetail";

// ✅ mock/data loaders (ปรับ path ให้ตรงโปรเจกต์จริงของคุณ)
import { getLicenseById } from "../../../../mock";
import { getAssignedTo, getAssignedToFilters } from "../../../../mock/assigned.mock";
import { getHistoryBySoftware } from "../../../../mock/history.mock"; // ← เพิ่ม import ให้ถูกไฟล์

type PageProps = { params: { id: string } };

export default async function LicenseDetailPage({ params }: PageProps) {
  // ❌ ไม่ต้อง await กับ params
  const { id } = await params;

  // 1) ดึงข้อมูลหลัก (license)
  const license = await getLicenseById(id);
  if (!license) {
    notFound(); // แสดงหน้า 404 อัตโนมัติ
  }

  // 2) Breadcrumbs
  const breadcrumbs = [
    { label: "Software Inventory", href: "/software/inventory" },
    { label: "License Management", href: "/software/license-management" },
    { label: license.softwareName, href: `/software/license/${id}` },
  ];

  // 3) ดึงข้อมูลส่วนติดตั้ง/กำหนดสิทธิ์ และ filter ที่เกี่ยวข้อง
  // - assigned: ส่วนใหญ่ฝั่ง license จะได้เป็น array ซ้อน (AssigenedRow[][]) → flatten ภายหลัง/ใน ClientDetail
  // - getAssignedToFilters(id): ให้ users/devices (ถ้าฟังก์ชันของคุณคืนโครงอื่น ปรับ destructure ให้ตรง)
  const assigned = await getAssignedTo(id);
  const history = await getHistoryBySoftware(id);

  // ป้องกันไม่มีค่า (กัน undefined)


  // (ตัวอย่าง) total ที่โชว์ในกล่อง summary
  // - ถ้ามี total จาก API จริง ให้ใช้ของจริง
  // - ถ้าไม่มีก็ใส่คงที่/หรือ derive จาก assigned.flat().length
  const total = typeof license.total === "number"
    ? license.total
    : (Array.isArray(assigned) ? assigned.flat().length : 0);

  return (
    <div style={{ padding: 6 }}>
      <BackButton />
      <PageHeader
        title={`License: ${license.softwareName}`}
        breadcrumbs={breadcrumbs}
      />
      <ClientDetail
        item={license}
        installations={assigned} // ⛳ ส่งเป็น AssigenedRow[][] ไปให้ ClientDetail จัดการ flatten/map ต่อ
        history={history}
        total={total}
      />
    </div>
  );
}

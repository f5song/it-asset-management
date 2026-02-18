// app/exceptions/[id]/page.tsx
import ExceptionsDetail from "@/components/detail/ExceptionDetail";
import BackButton from "@/components/ui/BackButton";
import { notFound } from "next/navigation";
import { getExceptionDefinitionById } from "@/services/exceptions.service";

type PageProps = { params: { id: string } }; // หรือใช้ PageParams<"id">

// (ทางเลือก) ปิด cache เพื่อให้เห็น error/log แบบสด ๆ
export const revalidate = 0;
// หรือใช้: export const dynamic = "force-dynamic";

export default async function ExceptionsDetailPage({ params }: PageProps) {
  const { id } = params ?? {};
  if (!id) return notFound();

  let exception = null;
  try {
    exception = await getExceptionDefinitionById(id);
  } catch (err) {
    // ป้องกันการล่มของ SSR ด้วยการ log แล้วโยน 404/แสดง page error ที่ควบคุมเอง
    console.error("getExceptionDefinitionById failed:", err);
    // คุณอาจเลือก return notFound() หรือแสดง fallback UI แทน
    // return notFound();
    throw err; // ถ้าต้องการให้ dev mode โชว์ stack trace
  }

  if (!exception) return notFound();

  const breadcrumbs = [
    { label: "Exceptions", href: "/exceptions" },
    {
      label: exception.name ?? `Exception ${exception.id}`,
      href: `/exceptions/${exception.id}`,
    },
  ];

  return (
    <div className="p-2">
      <BackButton />
      <ExceptionsDetail
        item={exception}
        history={[]}
        breadcrumbs={breadcrumbs}
      />
    </div>
  );
}
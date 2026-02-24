// app/exceptions/[id]/page.tsx
import ExceptionsDetail from "@/components/detail/ExceptionDetail";
import BackButton from "@/components/ui/BackButton";
import { notFound } from "next/navigation";
import { getExceptionDefinitionById } from "@/services/exceptions.service";
import type { ExceptionDefinitionRow } from "@/types/exception";

export const revalidate = 0;
// หรือใช้ export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExceptionsDetailPage({ params }: PageProps) {
  //   ต้อง await ก่อนใช้งาน
  const { id } = await params;
  if (!id) return notFound();

  let exception: ExceptionDefinitionRow | null = null;
  try {
    exception = await getExceptionDefinitionById(id);
  } catch (err) {
    console.error("getExceptionDefinitionById failed:", err);
    throw err;
  }

  if (!exception) return notFound();

  const breadcrumbs = [
    { label: "Exceptions", href: "/exceptions" },
    {
      label: exception.name ?? `Exception ${exception.exception_id}`,
      href: `/exceptions/${id}`, //   ใช้ id จาก route แทนค่าใน record ที่อาจชื่อ field ต่างกัน
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
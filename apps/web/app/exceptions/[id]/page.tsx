import ExceptionsDetail from "@/components/detail/ExceptionDetail";
import { getExceptionById } from "@/services/exceptions.service.mock";
import BackButton from "components/ui/BackButton";
import { notFound } from "next/navigation";

type PageProps = { params: { id: string } };

export default async function ExceptionsDetailPage({ params }: PageProps) {

  const { id } = await params;

  const exceptions = await getExceptionById(id);
  if (!exceptions) return notFound();

  const breadcrumbs = [
    { label: "Exceptions", href: "/exceptions" },
    { label: exceptions.name ?? `exceptions ${exceptions.id}`, href: `/exceptionss/${exceptions.id}` },
  ];

  return (
    <div className="p-2">
      <BackButton />
      <ExceptionsDetail
        item={exceptions}
        history={[]} 
        breadcrumbs={breadcrumbs}  // ถ้ามีประวัติจริง ให้เปลี่ยนเป็นค่าจาก service เช่น getHistoryByexceptions(id)
      />
    </div>
  );
}

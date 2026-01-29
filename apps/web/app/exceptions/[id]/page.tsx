import ExceptionsDetail from "@/components/detail/ExceptionDetail";
import { getExceptionDefinitionById } from "@/services/exceptions.service.mock";
import BackButton from "components/ui/BackButton";
import { notFound } from "next/navigation";

type PageProps = { params: { id: string } };

export default async function ExceptionsDetailPage({ params }: PageProps) {
  const { id } = await params; 

  const exception = await getExceptionDefinitionById(id);
  if (!exception) return notFound();

  const breadcrumbs = [
    { label: "Exceptions", href: "/exceptions" },
    { label: exception.name ?? `Exception ${exception.id}`, href: `/exceptions/${exception.id}` }, // ✅ แก้ path
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

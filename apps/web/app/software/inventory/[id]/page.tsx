import BackButton from "components/ui/BackButton";
import { PageHeader } from "components/ui/PageHeader";
import { getHistoryBySoftware } from "mock/history.mock";
import { getInstallationsBySoftware } from "mock/installation.mock";
import { notFound } from "next/navigation";
import { getItemById } from "services/software.service.mock";
import SoftwareDetail from "./SoftwareDetail";

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const item = await getItemById(id);
  if (!item) return notFound();

  // ✅ ใช้ของจริง ไม่ส่ง [] อีกต่อไป
  const [installations, history] = await Promise.all([
    getInstallationsBySoftware(id),
    getHistoryBySoftware(id),
  ]);

  const breadcrumbs = [
    { label: "Software Inventory", href: "/software/inventory" },
    { label: item.softwareName, href: `/software/inventory/${item.id}` },
  ];

  return (
    <div className="p-2">
      <BackButton />
      <SoftwareDetail
        item={item}
        installations={installations}
        history={history}
        breadcrumb={breadcrumbs}
      />
    </div>
  );
}

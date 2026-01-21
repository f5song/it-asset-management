
// app/software/inventory/[id]/page.tsx
import BackButton from "components/ui/BackButton";
import { PageHeader } from "components/ui/PageHeader";
import { getHistoryBySoftware } from "mock/history.mock";
import { getInstallationFilters, getInstallationsBySoftware } from "mock/installation.mock";
import { notFound } from "next/navigation";
import { getItemById } from "services/software.service.mock";
import SoftwareDetail from "./SoftwareDetail";

// (ถ้าต้องการให้ไม่แคช)
// export const dynamic = "force-dynamic";
// หรือ: export const revalidate = 0;

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const item = await getItemById(id);
  if (!item) return notFound();

  // รันขนานเพื่อความเร็ว
  const [installations, { users, devices }, history] = await Promise.all([
    getInstallationsBySoftware(id),
    getInstallationFilters(id),
    getHistoryBySoftware(id),
  ]);

  return (
    <div className="p-2"> 
      <BackButton />
      <PageHeader
        title={item.softwareName}
        breadcrumbs={[
          { label: "Software Inventory", href: "/software/inventory" },
          { label: item.softwareName, href: `/software/inventory/${item.id}` },
        ]}
      />
      <SoftwareDetail
        item={item}
        installations={installations}
        users={users}
        devices={devices}
        history={history}
        total={1250}
      />
    </div>
  );
}

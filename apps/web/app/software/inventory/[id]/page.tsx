// app/software/[id]/page.tsx
import { notFound } from "next/navigation";

import ClientDetail from "./ClientDetail";
import { getItemById } from "../../../../mock/software.mock";
import {
  getInstallationFilters,
  getInstallationsBySoftware,
} from "../../../../mock/installation.mock";
import { getHistoryBySoftware } from "../../../../mock/history.mock";
import { PageHeader } from "../../../../components/ui/PageHeader";
import BackButton from "../../../../components/ui/BackButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const item = await getItemById(id);
  if (!item) return notFound();

  const installations = await getInstallationsBySoftware(id);
  const { users, devices } = await getInstallationFilters(id);
  const history = await getHistoryBySoftware(id);

  return (
    <div style={{ padding: 6 }}>
      <BackButton />
      <PageHeader
        title={item.softwareName} // ✅ ใช้ฟิลด์ที่เป็น string
        breadcrumbs={[
          { label: "Software Inventory", href: "/software/inventory" },
          { label: item.softwareName, href: `/software/inventory/${item.id}` }, // ✅ label เป็น string, href ต่อ URL ถูกต้อง
        ]}
      />
      <ClientDetail
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

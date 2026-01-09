
// app/software/[id]/page.tsx
import { notFound } from "next/navigation";

import ClientDetail from "./ClientDetail";
import { getItemById } from "../../../mock/mockSoftware";
import { getInstallationFilters, getInstallationsBySoftware } from "../../../mock/installation.mock";
import { getHistoryBySoftware } from "../../../mock/history.mock";

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

  // ✅ ส่งเฉพาะ "ข้อมูล" ไปยัง Client Component
  return (
    <ClientDetail
      item={item}
      installations={installations}
      users={users}
      devices={devices}
      history={history}
      total={1250}
    />
  );
}

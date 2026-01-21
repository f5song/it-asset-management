
// app/devices/[id]/page.tsx
import BackButton from "components/ui/BackButton";
import { PageHeader } from "components/ui/PageHeader";
import { notFound } from "next/navigation";
import { getDeviceById } from "services/devices.service.mock";
import DeviceDetail from "./DeviceDetail";

type PageProps = { params: { id: string } };

export default async function DeviceDetailPage({ params }: PageProps) {
  const { id } = await params;

  const device = await getDeviceById(id);
  if (!device) return notFound();

  const breadcrumbs = [
    { label: "Devices", href: "/devices" },
    { label: device.name ?? `Device ${device.id}`, href: `/devices/${device.id}` },
  ];

  // หากอยากคำนวณจากฝั่ง ClientDetail ค่อยเปลี่ยนภายหลังได้
  const total = 0;

  return (
    <div className="p-2">
      <BackButton />
      <PageHeader title={device.name ?? `Device ${device.id}`} breadcrumbs={breadcrumbs} />
      <DeviceDetail
        item={device}
        history={[]}   // mock ได้ตามต้องการ
        total={total}
      />
    </div>
  );
}

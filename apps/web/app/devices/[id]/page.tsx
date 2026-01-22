
// app/devices/[id]/page.tsx
import BackButton from "components/ui/BackButton";
import { notFound } from "next/navigation";
import { getDeviceById } from "services/devices.service.mock";
import DeviceDetail from "./DeviceDetail";

type PageProps = { params: { id: string } };

export default async function DeviceDetailPage({ params }: PageProps) {
  const { id } = await params; // ✅ params เป็น synchronous object

  const device = await getDeviceById(id);
  if (!device) return notFound();

  const breadcrumbs = [
    { label: "Devices", href: "/devices" },
    { label: device.name ?? `Device ${device.id}`, href: `/devices/${device.id}` },
  ];

  // mock history ตามต้องการ
  const history: any[] = [];

  return (
    <div className="p-2">
      <BackButton />
      <DeviceDetail
        item={device}
        history={history}
        breadcrumbs={breadcrumbs} // ✅ ส่งไปให้ Header ด้านในด้วย
      />
    </div>
  );
}

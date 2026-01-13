import { PageHeader } from "../../../components/ui/PageHeader";
import StatGrid, { StatItem } from "../../../components/ui/StatGrid";

export default async function LicenseManagementPage() {
  // สมมติค่ามาจากฐานข้อมูล / API
  const total = 1234;
  const inUse = 300;
  const available = 5;
  const expiringSoon = 40;

  const items: StatItem[] = [
    { key: 'total', title: 'Total License', value: total, highlight: 'default' },
    { key: 'inuse', title: 'In Use', value: inUse, highlight: 'warning' },
    { key: 'available', title: 'Available', value: available, highlight: available > 0 ? 'good' : 'danger' },
    { key: 'expiring', title: 'Expiring Soon', value: expiringSoon, highlight: expiringSoon > 0 ? 'danger' : 'default' },
  ];

  return (
    <main>
      <PageHeader
        title="License Management"
        breadcrumbs={[
          { label: 'Software Inventory', href: '/software/inventory' },
          { label: 'License Management', href: '/software/license-management' },
        ]}
      />

      <StatGrid items={items} />

      {/* ที่เหลือของหน้า เช่น filter bar, table, pagination */}
    </main>
  );
}

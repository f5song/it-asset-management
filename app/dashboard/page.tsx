"use client";

import { Card } from "@/components/ui/Card";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import SemiRadialGauge from "@/components/charts/SemiRadialGauge";
import { dataDashboardCard } from "../../mock/dashboard.mock";
import { RecentLicenseActivityTable } from "@/components/ui/RecentLicenseActivityTable";
import HorizontalBarChart from "@/components/charts/HorizontalBarChar";
import { LicenseActivityData } from "@/mock/licenses.mock";

export default function DashboardPage() {
  return (
    <div className="flex flex-col m-6">
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

      {/* การ์ดสรุป */}
      <div className="flex flex-row justify-between gap-6">
        {dataDashboardCard.map((item) => (
          <Card key={item.id ?? item.title} title={item.title} count={item.count} />
        ))}
      </div>

      {/* แถวกราฟที่ 1 */}
      <div className="flex flex-row justify-between gap-6 mt-6">
        <BarChart />
        <HorizontalBarChart title="Top Countries by Metric" />
      </div>

      {/* แถวกราฟที่ 2 */}
      <div className="flex flex-row justify-between gap-6 mt-6">
        <DonutChart />
        <SemiRadialGauge value={92} title="Compliance Rate" color="#10b981" />
        <RecentLicenseActivityTable className="w-full max-w-[980px] min-w-[320px]" items={LicenseActivityData} />
      </div>
    </div>
  );
}



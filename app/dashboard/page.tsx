import { Card } from "@/components/ui/Card";
import BarChart from "@/components/charts/BarChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChar";
import DonutChart from "@/components/charts/DonutChart";
import SemiRadialGauge from "@/components/charts/SemiRadialGauge";
import {dataDashboardCard} from "../mock/dashboard.mock"
import { RecentLicenseActivityTable } from "@/components/ui/RecentLicenseActivityTable";

export default function DashboardPage() {
  return (
    <div className="flex flex-col m-6">
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>
      <div className="flex flex-row justify-between">
        {dataDashboardCard.map((item, index) => (
          <Card key={index} title={item.title} count={item.count} />
        ))}
      </div>
      <div className="flex flex-row justify-between">
        <BarChart />
        <HorizontalBarChart title="Top Countries by Metric" />
      </div>
      <div className="flex flex-row justify-between">
        <DonutChart />
        <SemiRadialGauge value={92} title="Compliance Rate" color="#10b981" />
        <RecentLicenseActivityTable items={[]}/>
      </div>
    </div>
  );
}

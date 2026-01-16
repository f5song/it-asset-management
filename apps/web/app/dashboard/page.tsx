"use client";

import React from "react";
import BarChart from "../../components/charts/BarChart";
import DonutChart from "../../components/charts/DonutChart";
import SemiRadialGauge from "../../components/charts/SemiRadialGauge";
import { Card } from "../../components/ui/Card";
import { RecentLicenseActivityTable } from "../../components/ui/RecentLicenseActivityTable";
import { dataDashboardCard, LicenseActivityData } from "../../mock";
import HorizontalBarChart from "../../components/charts/HorizontalBarChar";
import { Panel } from "../../components/ui/Panel";

export default function DashboardPage() {
  return (
    <div className="w-full flex justify-center">
      {/* ✅ จำกัดความกว้างรวมให้ดูแคบ, พอดีจอ */}
      <div className="w-full max-w-5xl px-3 md:px-4 py-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-2xl md:text-[26px] font-semibold tracking-tight">
            Dashboard
          </h1>
        </div>

        {/* Summary Cards (เตี้ย กะทัดรัด) */}

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {dataDashboardCard.map((item) => (
            <Card
              key={item.id ?? item.title}
              title={item.title}
              count={item.count}
              compact
              className="h-[88px]"
            />
          ))}
        </div>

        {/* แถวกราฟ 1 */}
        <div className="mt-4 grid grid-cols-12 gap-3">
          <Panel className="col-span-12 md:col-span-7 lg:col-span-8">
            <BarChart height={280} />
          </Panel>

          <Panel className="col-span-12 md:col-span-5 lg:col-span-4">
            <HorizontalBarChart height={280} title="License Expiry Trend" />
          </Panel>
        </div>

        {/* แถวกราฟ 2 + ตาราง (วิธีที่เลือก) */}
        <div className="mt-3 grid grid-cols-12 gap-3">
          {/* ซ้าย: Donut + Gauge (ซ้อนในคอลัมน์เดียวกันบน lg) */}
          <div className="col-span-12 lg:col-span-4 space-y-3">
            <Panel>
              <DonutChart height={150} />
            </Panel>

            <Panel>
              <SemiRadialGauge
                value={92}
                title="Compliance Rate"
                height={150}
              />
            </Panel>
          </div>

          {/* ขวา: Recent Activity (กว้าง 8/12 บน lg) */}
          <Panel className="col-span-12 lg:col-span-8">
            <h3 className="text-sm font-semibold mb-2">
              Recent License Activity
            </h3>
            {/* เพิ่ม maxHeight ให้เห็นหลายแถวขึ้น (ปรับได้ตามใจ) */}
            <RecentLicenseActivityTable
              items={LicenseActivityData}
              maxHeight={320}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

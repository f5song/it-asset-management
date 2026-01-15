
'use client';

import React from 'react';
import BarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';

import SemiRadialGauge from '../../components/charts/SemiRadialGauge';
import { Card } from '../../components/ui/Card'; // ใช้ Card เดิมของพี่
import { RecentLicenseActivityTable } from '../../components/ui/RecentLicenseActivityTable';
import { dataDashboardCard, LicenseActivityData } from '../../mock';
import HorizontalBarChart from '../../components/charts/HorizontalBarChar';

function Panel({
  children,
  className = '',
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section className={`rounded-md bg-white shadow-sm ${className}`}>
      {title ? (
        <div className="px-3 pt-2 pb-1">
          <h2 className="text-[13px] font-semibold tracking-tight text-slate-700">
            {title}
          </h2>
        </div>
      ) : null}
      <div className="p-3">{children}</div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <div className="w-full flex justify-center">
      {/* ✅ จำกัดความกว้างรวมให้ดูแคบ, พอดีจอ */}
      <div className="w-full max-w-5xl px-3 md:px-4 py-4">
        {/* ให้เลื่อนลงได้เล็กน้อย */}
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto pr-1">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between gap-2">
            <h1 className="text-2xl md:text-[26px] font-semibold tracking-tight">
              Dashboard
            </h1>
          </div>

          {/* Summary Cards (เตี้ย กะทัดรัด) */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dataDashboardCard.map((item) => (
              <Panel key={item.id ?? item.title} className="p-0">
                <div className="h-[88px] flex items-center">
                  <Card title={item.title} count={item.count} />
                </div>
              </Panel>
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

          {/* แถวกราฟ 2 + ตาราง */}
          <div className="mt-3 grid grid-cols-12 gap-3">
            <Panel className="col-span-12 md:col-span-6 lg:col-span-4">
              <DonutChart height={260} />
            </Panel>

            <Panel className="col-span-12 md:col-span-6 lg:col-span-4">
              <SemiRadialGauge value={92} title="Compliance Rate" height={260} />
            </Panel>

            <Panel className="col-span-12 lg:col-span-4">
              <h3 className="text-sm font-semibold mb-2">Recent License Activity</h3>
              <RecentLicenseActivityTable items={LicenseActivityData} />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

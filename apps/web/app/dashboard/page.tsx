"use client";

import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Card } from "@/components/ui/Card";
import BarChart from "@/components/charts/BarChart";
import HorizontalBarChart from "@/components/charts/HorizontalBarChar";
import DonutChart from "@/components/charts/DonutChart";
import SemiRadialGauge from "@/components/charts/SemiRadialGauge";
import { LicenseSummaryCards } from "@/components/charts/LicenseSummaryCards";

import { useExceptionsMetrics } from "@/hooks/useExceptionsMetrics";
import type { ExceptionDefinition } from "@/types/exception";

import { FiCpu, FiMonitor, FiAlertCircle, FiInbox } from "react-icons/fi";

const exceptionsMock: ExceptionDefinition[] = [
  {
    id: "EXC-024",
    name: "Bypass Proxy",
    risk: "High",
    status: "Inactive",
    createdAt: "2025-11-24T08:00:00Z",
  },
  {
    id: "EXC-101",
    name: "Allow Sideload",
    risk: "Medium",
    status: "Active",
    createdAt: "2025-11-20T03:00:00Z",
  },
  {
    id: "EXC-115",
    name: "Disable USB Lock",
    risk: "High",
    status: "Active",
    createdAt: "2025-12-02T02:00:00Z",
  },
  {
    id: "EXC-130",
    name: "Allow Legacy TLS",
    risk: "Low",
    status: "Inactive",
    createdAt: "2025-10-18T01:00:00Z",
  },
  {
    id: "EXC-151",
    name: "Whitelist Domain",
    risk: "Medium",
    status: "Active",
    createdAt: "2025-12-18T08:00:00Z",
  },
];

const ORG_SOFTWARE_TOTAL = 1345;
const ORG_DEVICES_REGISTERED = 500;
const ORG_PENDING_REQUESTS = 10;

export default function DashboardPage() {
  const { active, inactive, byRisk } = useExceptionsMetrics(exceptionsMock);

  const topLeftCards = [
    {
      id: 1,
      title: "Total Software",
      count: ORG_SOFTWARE_TOTAL,
      icon: <FiCpu />, // ซอฟต์แวร์/ระบบ
      tone: "blue" as const, // โทนฟ้า อ่านสบาย
    },
    {
      id: 2,
      title: "Devices Registered",
      count: ORG_DEVICES_REGISTERED,
      icon: <FiMonitor />, // อุปกรณ์/เครื่อง
      tone: "green" as const, // โทนเขียว
    },
    {
      id: 3,
      title: "Active Exceptions",
      count: active,
      icon: <FiAlertCircle />, // คำเตือน/ข้อยกเว้น
      tone: "amber" as const, // โทนเหลืองส้ม เตือนสายตา
    },
    {
      id: 4,
      title: "Pending Requests",
      count: ORG_PENDING_REQUESTS,
      icon: <FiInbox />, // กล่องคำขอค้าง
      tone: "violet" as const, // โทนม่วง แยกหมวดงาน
    },
  ] as const;

  return (
    <div className="mb-4">
      <PageHeader title="Dashboard" />

      {/* TOP AREA: ซ้าย (4 ใบ) / ขวา (License 2 คอลัมน์) */}
      <div className="mt-3 grid grid-cols-12 gap-3">
        {/* Left: 4 ใบ (อ่านง่าย ไม่ truncate) */}
        <div className="col-span-12 lg:col-span-6">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {topLeftCards.map((item) => (
              <Card
                key={item.id}
                title={item.title}
                count={item.count}
                icon={item.icon} 
                tone={item.tone} 
                compact
                hideFooter
                className="h-[84px]" // สูงกำลังดี
              />
            ))}
          </div>
        </div>

        {/* Right: License Summary → 2 ใบ/แถว, ไม่มี wrapper ซ้อน */}
        <div className="col-span-12 lg:col-span-6">
          {/* บังคับ 2 คอลัมน์ที่นี่ เพื่อไม่เบียด */}
          <LicenseSummaryCards className="grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-2 gap-3 !mt-0" />
        </div>
      </div>

      {/* ROW 1 */}
      <div className="mt-4 grid grid-cols-12 gap-3">
        <Panel className="col-span-12 lg:col-span-8">
          <BarChart
            title="Activity (Monthly)"
            height={280}
            labels={[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ]}
            datasets={[
              {
                label: "License Assigned",
                data: [
                  220, 260, 280, 310, 330, 360, 380, 400, 390, 420, 440, 470,
                ],
                color: "#3b82f6",
              },
              {
                label: "License Reclaimed",
                data: [60, 50, 55, 70, 65, 62, 58, 60, 59, 68, 72, 80],
                color: "#10b981",
              },
            ]}
          />
        </Panel>

        <div className="col-span-12 lg:col-span-4 space-y-3">
          <Panel>
            <DonutChart
              title="Exceptions by Status"
              height={200}
              labels={["Active", "Inactive"]}
              values={[active, inactive]}
              colors={["#f59e0b", "#94a3b8"]}
              legendPosition="right"
            />
          </Panel>
          <Panel>
            <SemiRadialGauge value={92} title="Compliance Rate" height={140} />
          </Panel>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="mt-4 grid grid-cols-12 gap-3">
        <Panel className="col-span-12 md:col-span-7 lg:col-span-8">
          <HorizontalBarChart
            height={240}
            title="License Expiry Trend"
            labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
            values={[5, 8, 12, 7, 18, 28]}
          />
        </Panel>

        <Panel className="col-span-12 md:col-span-5 lg:col-span-4">
          <DonutChart
            title="Software by Type"
            height={240}
            values={[94, 6]}
            labels={["Standard", "Special"]}
            colors={["#10b981", "#3b82f6"]}
            legendPosition="bottom"
          />
        </Panel>
      </div>
    </div>
  );
}

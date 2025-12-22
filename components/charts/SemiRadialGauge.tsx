
// components/charts/SemiRadialGauge.tsx
"use client";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type SemiRadialGaugeProps = {
  value?: number;      // 0 - 100 (%)
  title?: string;
  height?: number;
  color?: string;      // สีของค่า เช่น "#10b981"
};

export default function SemiRadialGauge({
  value = 92,
  title = "Compliance Rate",
  height = 260,
  color = "#10b981",
}: SemiRadialGaugeProps) {

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      radialBar: {
        // ✅ กำหนดให้เป็นครึ่งวงกลม
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "60%",
        },
        track: {
          background: "#e5e7eb", // เทาอ่อน
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "12px",
            offsetY: -20,
            color: "#6b7280",
          },
          value: {
            show: true,
            fontSize: "28px",
            fontWeight: 700,
            formatter: (v: number) => `${Math.round(v)}%`,
            offsetY: -4,
          },
        },
      },
    },
    // สีหลักของเสี้ยวค่า
    colors: [color],
    // ไล่เฉดสีให้ดูนุ่มนวลขึ้น (เอาออกได้)
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        gradientToColors: [color],
        stops: [0, 100],
      },
    },
    labels: [title],
    // ปิด legend/tooltip (ถ้าอยากแสดงเปิดได้)
    legend: { show: false },
    tooltip: {
      enabled: true,
      y: { formatter: (val: number) => `${Math.round(val)}%` },
    },
  };

  const series = [value]; // ค่าเป็น % 0-100

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <ReactApexChart options={options} series={series} type="radialBar" height={height} />
    </div>
  );
}


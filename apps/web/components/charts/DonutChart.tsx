// components/charts/DonutChart.tsx
"use client";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type DonutChartProps = {
  title?: string;
  series?: number[];
  labels?: string[];
  colors?: string[];
  height?: number;
};

export default function DonutChart({
  title = "Software by Type",
  series = [30, 70],
  labels = ["Standard", "Special"],
  colors = ["#465fff", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"],
  height = 300,
}: DonutChartProps) {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    labels, // ป้ายกำกับของแต่ละชิ้น
    colors, // สีของชิ้นวงกลม

    legend: {
      show: true,
      position: "right",
      horizontalAlign: "center",
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      } as any,
    },

    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`, // แสดงเป็นเปอร์เซ็นต์
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()}`, // รูปแบบตัวเลข
      },
    },
    // ✅ ทำให้ responsive เหมือนตัวอย่าง vanilla ของคุณ
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 220 },
          legend: { position: "bottom" },
        },
      },
    ],
    // ✅ ใส่ label รวมตรงกลาง (เฉพาะ donut)
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: (w: any) => {
                const sum = w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                return sum.toLocaleString();
              },
            },
            value: {
              show: true,
              fontSize: "16px",
              fontWeight: 600,
            },
            name: {
              show: true,
              fontSize: "12px",
              offsetY: -6,
            },
          },
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
      )}
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={height}
      />
    </div>
  );
}

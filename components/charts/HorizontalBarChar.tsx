"use client";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type HorizontalBarChartProps = {
  title?: string;
  categories?: string[];
  data?: number[];
  height?: number;
};

export default function HorizontalBarChart({
  title = "Top Countries by Metric",
  categories = [
    "Jun",
    "May",
    "Apr",
    "Mar",
    "Feb",
    "๋Jan",
  ],
  data = [5,10,15,20,12,3],
  height = 350,
}: HorizontalBarChartProps) {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,           // ✅ กราฟแนวนอน
        borderRadius: 4,
        borderRadiusApplication: "end", // ✅ มุมโค้งเฉพาะปลายแท่ง
        barHeight: "60%",           // ปรับความหนาแท่ง (แล้วแต่ดีไซน์)
      },
    },
    colors: ["#465fff"],            // สีแท่ง
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: "12px" },
        // ถ้าชื่อหมวดหมู่ยาวมาก สามารถตัดให้สั้นได้
        // formatter: (val: string) => (val.length > 18 ? val.slice(0, 18) + "…" : val),
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px" },
      },
    },
    grid: {
      xaxis: { lines: { show: true } },
    },
    tooltip: {
      // ✅ แสดงชื่อเต็มของ category ตอน hover (แม้จะตัดบนแกนไว้)
      x: {
        show: true,
        formatter: (_value: string, { dataPointIndex }: any) =>
          categories[dataPointIndex] ?? _value,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
    legend: { show: false },
  };

  const series = [
    {
      name: "Value",
      data,
    },
  ];

  return (
    <div className="w-lg rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
      )}
      <ReactApexChart options={options} series={series} type="bar" height={height} />
    </div>
  );
}

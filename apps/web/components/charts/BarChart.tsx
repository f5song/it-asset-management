"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function BarChart() {
  const COLORS = { used: "#465fff", available: "#7c3aed" };

  const categories = [
    "Microsoft 365",
    "SAP",
    "Adobe Design Standard CS6.0",
    "Autodesk 3ds Max 2017",
    "Microsoft Office Standard 2013",
  ];

  const truncate = (str: string, limit: number) =>
    str.length > limit ? str.slice(0, limit).trim() + "…" : str;

  const options: ApexOptions = {
    colors: [COLORS.used, COLORS.available],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 240,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        trim: true,
        style: { fontSize: "11px", fontFamily: "Outfit, sans-serif" },
        formatter: (val: string) => truncate(val, 14), // ตัดบนแกน X
      },
      tooltip: { enabled: true },
    },
    legend: { show: false }, // ใช้ custom legend ด้านนอก
    yaxis: {
      min: 0,
      max: 2500,
      tickAmount: 5, // 0, 500, 1000, 1500, 2000, 2500 (5 ช่อง = 6 ticks)
      labels: {
        formatter: (val: number) => `${val}`,
        style: { fontSize: "11px", fontFamily: "Outfit, sans-serif" },
      },
    },
    grid: { yaxis: { lines: { show: true } } },

    // ✅ ให้ tooltip แสดงชื่อเต็มจาก categories
    tooltip: {
      x: {
        show: true,
        formatter: (_value: string, { dataPointIndex }: any) => {
          // ดึงชื่อเต็มจาก categories โดยอิง index ของแท่งที่ hover
          return categories[dataPointIndex] ?? _value;
        },
      },
      y: { formatter: (val: number) => `${val}` },
    },

    fill: { opacity: 1 },
  };

  const series = [
    { name: "Used", data: [1500, 1300, 450, 2300, 1890] },
    { name: "Available", data: [1300, 1300, 1190, 1260, 870] },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          License Allocation
        </h3>

        {/* ✅ Custom Legend แบบวงกลม */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS.used }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">Used</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS.available }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">Available</span>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[720px] xl:min-w-full pl-2">
          <ReactApexChart options={options} series={series} type="bar" height={240} />
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import "../../lib/chartjs";
import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";

type Dataset = {
  label: string;
  data: number[];
  color?: string;
};

type Props = {
  title?: string;
  className?: string;
  height?: number;
  labels?: string[];
  datasets?: Dataset[];
};

const DEFAULT_LABELS = [
  "Microsoft 365",
  "SAP",
  "Adobe Design",
  "Autodesk 3ds",
  "Lightroom",
  "SketchUp",
  "MS Office",
];

const DEFAULT_DATASETS: Dataset[] = [
  { label: "Used",      data: [1200, 900, 420, 1500, 680, 980, 1750], color: "#3b82f6" },
  { label: "Available", data: [800,  650, 310,  720, 520, 460,  820], color: "#10b981" },
];

export default function BarChart({
  title = "Bar Chart",
  className,
  height = 280,
  labels = DEFAULT_LABELS,
  datasets = DEFAULT_DATASETS,
}: Props) {
  const data: ChartData<"bar"> = {
    labels,
    datasets: datasets.map((d) => ({
      label: d.label,
      data: d.data,
      backgroundColor: d.color ?? "#60a5fa",
      hoverBackgroundColor: d.color ?? "#3b82f6",
      borderRadius: 6,
      maxBarThickness: 36,
    })),
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { boxWidth: 10 } },
      title: { display: Boolean(title), text: title },
      tooltip: { enabled: true },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        type: "category",
        ticks: { maxRotation: 0, minRotation: 0 },
        grid: { display: false },         // ❌ drawBorder →   display
        border: { display: false },       // 🔹 ปิดเส้นกรอบแกน
      },
      y: {
        type: "linear",
        beginAtZero: true,
        grid: { display: true },          // แสดงเส้น grid ได้
        border: { display: false },       // 🔹 ปิดกรอบแกน
      },
    },
    animation: { duration: 300 },
  };

  return (
    <div className={className} style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}

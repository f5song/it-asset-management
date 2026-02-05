"use client";

import React from "react";
import "../../lib/chartjs";
import { Bar } from "react-chartjs-2";

type Props = {
  title?: string;
  className?: string;
  height?: number;
  labels?: string[];
  values?: number[];
  color?: string;
  optionsOverride?: any; // สามารถส่ง options ทับได้
};

export default function HorizontalBarChart({
  title,
  className,
  height = 280,
  labels = [],
  values = [],
  color = "#10b981",
  optionsOverride,
}: Props) {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: color,
        borderRadius: 8,
        barThickness: 16,
        hoverBackgroundColor: "#059669", // emerald-600
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title },
      tooltip: { enabled: true },
    },
    scales: {
      x: { beginAtZero: true, grid: { drawBorder: false } },
      y: { ticks: { autoSkip: false }, grid: { display: false } },
    },
    animation: { duration: 300 },
    ...optionsOverride, // allow override
  };

  return (
    <div className={className} style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}

"use client";

import React from "react";
import "../../lib/chartjs";
import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

type LegendPos = "top" | "right" | "bottom" | "left";

type Props = {
  title?: string;
  className?: string;
  height?: number;
  values?: number[];
  labels?: string[];
  colors?: string[];
  legendPosition?: LegendPos;
  cutout?: string | number;
};

const DEFAULT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#a78bfa"];

export default function DonutChart({
  title,
  className,
  height = 180,
  values = [],
  labels = [],
  colors = DEFAULT_COLORS,
  legendPosition = "right",
  cutout = "65%",
}: Props) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  //   ระบุชนิด options ให้ชัดเจน
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: legendPosition },
      title: { display: Boolean(title), text: title },
      tooltip: { enabled: true },
    },
    cutout,
  };

  return (
    <div className={className} style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
``
"use client";

import React from "react";
import "../../lib/chartjs";
import { Doughnut } from "react-chartjs-2";
import type { Plugin } from "chart.js";

type Props = {
  value: number;     // 0-100
  title?: string;
  className?: string;
  height?: number;
  color?: string;     // ถ้าส่งมา จะ override threshold
  thresholds?: { good: number; warn: number }; // NEW: เปลี่ยนสีอัตโนมัติ
};

const centerTextPlugin = (text: string): Plugin => ({
  id: "centerText",
  afterDraw(chart) {
    const { ctx, chartArea } = chart as any;
    if (!ctx || !chartArea) return;
    ctx.save();
    const { left, right, bottom, height } = chartArea;
    const centerX = (left + right) / 2;
    const centerY = bottom - height * 0.25;
    ctx.font = "700 28px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, centerX, centerY);
    ctx.restore();
  },
});

export default function SemiRadialGauge({
  value,
  title,
  className,
  height = 150,
  color,
  thresholds = { good: 80, warn: 40 },
}: Props) {
  const v = Math.max(0, Math.min(100, value));
  // Auto color by thresholds
  const autoColor =
    v >= thresholds.good ? "#10b981" : v >= thresholds.warn ? "#f59e0b" : "#ef4444";

  const data = {
    labels: [title ?? ""],
    datasets: [
      {
        data: [v, 100 - v],
        backgroundColor: [color ?? autoColor, "#e5e7eb"],
        borderWidth: 0,
        hoverOffset: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    circumference: 180, // ครึ่งวง
    rotation: -90, // เริ่มจากซ้ายไปขวา
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${Math.round(ctx.raw)}%`,
        },
      },
    },
    cutout: "60%",
  };

  return (
    <div className={className} style={{ height }}>
      <Doughnut data={data} options={options as any} plugins={[centerTextPlugin(`${v}%`)]} />
    </div>
  );
}
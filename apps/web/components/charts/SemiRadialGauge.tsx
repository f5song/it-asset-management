
'use client';

import React from 'react';
import '../../lib/chartjs';
import { Doughnut } from 'react-chartjs-2';
import type { Plugin } from 'chart.js';

type Props = {
  value?: number;     // 0-100
  title?: string;
  className?: string;
  height?: number;
  color?: string;
};

const centerTextPlugin = (text: string): Plugin => ({
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!ctx || !chartArea) return;

    ctx.save();
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = chartArea.bottom - (chartArea.height * 0.25);

    ctx.font = '700 28px Outfit, sans-serif';
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX, centerY);
    ctx.restore();
  },
});

export default function SemiRadialGauge({
  value = 92,
  title = 'Compliance Rate',
  className,
  height = 260,
  color = '#10b981',
}: Props) {
  const v = Math.max(0, Math.min(100, value));
  const data = {
    labels: [title],
    datasets: [
      {
        data: [v, 100 - v],
        backgroundColor: [color, '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    circumference: 180, // ครึ่งวง
    rotation: -90,       // เริ่มจากซ้ายไปขวา
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${Math.round(ctx.raw)}%`,
        },
      },
    },
    cutout: '60%',
  };

  return (
    <div className={className} style={{ height }}>
      <Doughnut data={data} options={options as any} plugins={[centerTextPlugin(`${v}%`)]} />
    </div>
  );
}


'use client';

import React from 'react';
import '../../lib/chartjs';
import { Bar } from 'react-chartjs-2';

type Props = {
  title?: string;
  className?: string;
  height?: number;
  labels?: string[];
  values?: number[];
  color?: string;
};

export default function HorizontalBarChart({
  title = 'License Expiry Trend',
  className,
  height = 280,
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  values = [5, 8, 12, 7, 18, 28],
  color = '#10b981',
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
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title },
      tooltip: { enabled: true },
    },
    scales: {
      x: { beginAtZero: true },
      y: { ticks: { autoSkip: false } },
    },
  };

  return (
    <div className={className} style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}

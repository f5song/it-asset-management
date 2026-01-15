
'use client';

import React from 'react';
import '../../lib/chartjs'; // ensure ChartJS registered
import { Bar } from 'react-chartjs-2';

type Props = {
  title?: string;
  className?: string;
  height?: number; // ถ้าอยาก override ความสูงของ container
};

export default function BarChart({ title = 'License Allocation', className, height = 280 }: Props) {
  const data = {
    labels: ['Microsoft 365', 'SAP', 'Adobe Design', 'Autodesk 3ds', 'Lightroom', 'SketchUp', 'MS Office'],
    datasets: [
      {
        label: 'Used',
        data: [1200, 900, 420, 1500, 680, 980, 1750],
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
      {
        label: 'Available',
        data: [800, 650, 310, 720, 520, 460, 820],
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: { position: 'top' as const, labels: { boxWidth: 10 } },
      title: { display: !!title, text: title },
    },
    scales: {
      x: { ticks: { maxRotation: 0, minRotation: 0 } },
      y: { beginAtZero: true },
    },
  };

  return (
    <div className={className} style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}

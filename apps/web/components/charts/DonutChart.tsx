
'use client';

import React from 'react';
import '../../lib/chartjs';
import { Doughnut } from 'react-chartjs-2';

type Props = {
  title?: string;
  className?: string;
  height?: number;
  values?: number[]; // [Standard, Special]
};

export default function DonutChart({
  title = 'Software by Type',
  className,
  height = 260,
  values = [94, 6],
}: Props) {
  const data = {
    labels: ['Standard', 'Special'],
    datasets: [
      {
        data: values,
        backgroundColor: ['#10b981', '#3b82f6'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: { position: 'right' as const },
      title: { display: !!title, text: title },
      tooltip: { enabled: true },
    },
    cutout: '65%',
  };

  return (
    <div className={className} style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

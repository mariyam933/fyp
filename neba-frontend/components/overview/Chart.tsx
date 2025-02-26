'use client';

import React from 'react';
import { ApexChart } from './ApexChart';

export interface SalesProps {
  chartSeries: { name: string; data: number[] }[];
}

export function Chart({ chartSeries }: SalesProps): React.JSX.Element {
  const chartOptions = useChartOptions();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Monthly Consumption Analysis
        </h2>
      </div>
      <div className="mt-4">
        <ApexChart
          height={350}
          options={chartOptions}
          series={chartSeries}
          type="bar"
          width="100%"
        />
      </div>
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-end">
        <button className="text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 flex items-center">
          Overview
        </button>
      </div>
    </div>
  );
}

function useChartOptions(): any {
  return {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: { show: false },
    },
    colors: ['#3b82f6', 'rgba(59, 130, 246, 0.25)'],
    dataLabels: { enabled: false },
    fill: { opacity: 1, type: 'solid' },
    grid: {
      borderColor: '#e5e7eb', // Tailwind's `gray-200`
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { show: false },
    plotOptions: { bar: { columnWidth: '40px' } },
    stroke: { colors: ['transparent'], show: true, width: 2 },
    xaxis: {
      axisBorder: { color: '#e5e7eb', show: true },
      axisTicks: { color: '#e5e7eb', show: true },
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      labels: {
        offsetY: 5,
        style: { colors: '#6b7280' }, // Tailwind's `gray-500`
      },
    },
    yaxis: {
      labels: {
        formatter: (value: number) => (value > 0 ? `${value}K` : `${value}`),
        offsetX: -10,
        style: { colors: '#6b7280' }, // Tailwind's `gray-500`
      },
    },
  };
}

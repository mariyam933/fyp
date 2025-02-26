import React from 'react';
import dayjs from 'dayjs';

const statusMap = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
} as const;

export interface Order {
  id: string;
  customer: { name: string };
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
}

export interface LatestOrdersProps {
  orders?: Order[];
}

export function LatestOrders({ orders = [] }: LatestOrdersProps): React.JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-10 border border-gray-100">
      <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Overview</h2>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300">Invoice</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300">Customer</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300">Date</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const { label, color } = statusMap[order.status] ?? {
                label: 'Unknown',
                color: 'bg-gray-100 text-gray-800',
              };

              return (
                <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{order.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {order.customer.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {dayjs(order.createdAt).format('MMM D, YYYY')}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${color}`}
                    >
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-end">
        <button className="text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 flex items-center">
          View all
        </button>
      </div>
    </div>
  );
}

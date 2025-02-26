import BudgetCard from '@/components/overview/BudgetCard'
import { Chart } from '@/components/overview/Chart'
import React from 'react'
import dayjs from 'dayjs'
import { LatestOrders } from '@/components/overview/LatestOrders'

export default function index() {
  return (
    <div>
      <BudgetCard />
      <div className='mt-5 border border-gray-100 rounded-lg'>
        <Chart
          chartSeries={[
            { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: 'Last year', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
        />

      </div>
      <LatestOrders
        orders={[
          {
            id: 'ORD-007',
            customer: { name: 'Ekaterina Tankova' },
            amount: 30.5,
            status: 'pending',
            createdAt: dayjs().subtract(10, 'minutes').toDate(),
          },
          {
            id: 'ORD-006',
            customer: { name: 'Cao Yu' },
            amount: 25.1,
            status: 'paid',
            createdAt: dayjs().subtract(10, 'minutes').toDate(),
          },
          {
            id: 'ORD-004',
            customer: { name: 'Alexa Richardson' },
            amount: 10.99,
            status: 'overdue',
            createdAt: dayjs().subtract(10, 'minutes').toDate(),
          },
          {
            id: 'ORD-003',
            customer: { name: 'Anje Keizer' },
            amount: 96.43,
            status: 'pending',
            createdAt: dayjs().subtract(10, 'minutes').toDate(),
          },
          {
            id: 'ORD-002',
            customer: { name: 'Clarke Gillebert' },
            amount: 32.54,
            status: 'paid',
            createdAt: dayjs().subtract(10, 'minutes').toDate(),
          },
          {
            id: 'ORD-001',
            customer: { name: 'Adam Denisov' },
            amount: 16.76,
            status: 'paid',
            createdAt: dayjs().subtract(10, 'minutes').toDate(),
          },
        ]}
      />
    </div>
  )
}

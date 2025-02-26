import { AlignJustify, ArrowDown, ArrowUp, DollarSign, MoveUp, ReceiptText, Users } from 'lucide-react'
import React from 'react'

export default function BudgetCard() {
  return (
    <>
      <div className='flex items-center gap-4 w-full mt-7'>
        
        <div className='border border-gray-100 rounded-lg p-4 py-8 shadow w-1/4'>
          <div className='flex w-full'>
            <div className=''>
              <p className='text-gray-500 text-sm font-medium '>Financial Overview</p>
              <h1 className='text-4xl font-semibold mt-5'>$12k</h1>
            </div>
            <div className='bg-blue-500 text-white p-2 flex items-center justify-center h-14 w-14 rounded-full ml-auto'>
              <DollarSign />
            </div>
          </div>
          <div className='flex items-center mt-5 gap-2'>
            <div className='text-green-500 flex items-center gap-2'>
              <ArrowUp />
              <p>12%</p>
            </div>
            <p className='text-gray-500 text-xs font-medium'>Since last month</p>
          </div>
        </div>

        <div className='border border-gray-100 rounded-lg p-4 py-8 shadow w-1/4'>
          <div className='flex w-full'>
            <div className=''>
              <p className='text-gray-500 text-sm font-medium '>Total Users</p>
              <h1 className='text-4xl font-semibold mt-5'>$1.5k</h1>
            </div>
            <div className='bg-teal-500 text-white p-2 flex items-center justify-center h-14 w-14 rounded-full ml-auto'>
              <Users />
            </div>
          </div>
          <div className='flex items-center mt-5 gap-2'>
            <div className='text-red-500 flex items-center gap-2'>
              <ArrowDown />
              <p>16%</p>
            </div>
            <p className='text-gray-500 text-xs font-medium'>Since last month</p>
          </div>
        </div>

        <div className='border border-gray-100 rounded-lg p-4 py-8 shadow w-1/4'>
          <div className='flex w-full'>
            <div className=''>
              <p className='text-gray-500 text-sm font-medium '>Total bills paid</p>
              <h1 className='text-4xl font-semibold mt-5'>$12k</h1>
            </div>
            <div className='bg-orange-500 text-white p-2 flex items-center justify-center h-14 w-14 rounded-full ml-auto'>
            <AlignJustify />
            </div>
          </div>
          <div className='flex items-center mt-5 gap-2'>
            <div className='text-green-500 flex items-center gap-2'>
              <ArrowUp />
              <p>12%</p>
            </div>
            <p className='text-gray-500 text-sm font-medium'>Since last month</p>
          </div>
        </div>


        <div className='border border-gray-100 rounded-lg p-4 py-8 shadow w-1/4'>
          <div className='flex w-full'>
            <div className=''>
              <p className='text-gray-500 text-sm font-medium '>Pending bills</p>
              <h1 className='text-4xl font-semibold mt-5'>$1.5k</h1>
            </div>
            <div className='bg-sky-500 text-white p-2 flex items-center justify-center h-14 w-14 rounded-full ml-auto'>
            <ReceiptText />
            </div>
          </div>
          <div className='flex items-center mt-5 gap-2'>
            <div className='text-red-500 flex items-center gap-2'>
              <ArrowDown />
              <p>16%</p>
            </div>
            <p className='text-gray-500 text-xs font-medium'>Since last month</p>
          </div>
        </div>

      </div>
    </>
  )
}

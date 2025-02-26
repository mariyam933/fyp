

import BillsTable from '@/components/bills/BillsTable'
import { axiosClient } from '@/utils/axiosClient'
import { useRouter } from 'next/router'

import React, { useEffect } from 'react'

export default function Bills() {
  const [tabledata, setTabledata] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [refreshUI, setRefreshUI] = React.useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const res = await axiosClient.get('api/bill/'+router.query.customerId)
        console.log('res', res)
        setTabledata(res.data)
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    }
    if(router.query.customerId){
      fetchCustomers()
    }
  }, [refreshUI, router.query.customerId])

  return (
    <div className='py-2 bg-white'>
      <BillsTable tabledata={tabledata} loading={loading} setRefreshUI={setRefreshUI} />
    </div>
  )
}

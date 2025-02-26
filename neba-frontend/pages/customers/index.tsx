
import CustomersTable from '@/components/customers/CustomersTable'
import { axiosClient } from '@/utils/axiosClient'

import React, { useEffect } from 'react'

export default function Customers() {
  const [tabledata, setTabledata] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [refreshUI, setRefreshUI] = React.useState<boolean>(false)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const res = await axiosClient.get('api/customer/')
        setTabledata(res.data)
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    }
    fetchCustomers()
  }, [refreshUI])

  return (
    <div className='py-2 bg-white'>
      <CustomersTable tabledata={tabledata} loading={loading} setRefreshUI={setRefreshUI} />
    </div>
  )
}

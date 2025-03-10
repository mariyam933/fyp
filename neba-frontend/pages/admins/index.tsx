
import CustomersTable from '@/components/customers/CustomersTable'
import AdminTable from '@/components/admins/AdminTable'
import { axiosClient } from '@/utils/axiosClient'

import React, { useEffect } from 'react'

export default function Admins() {
  const [tabledata, setTabledata] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [refreshUI, setRefreshUI] = React.useState<boolean>(false)

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true)
        const res = await axiosClient.get('api/admin/')
        setTabledata(res.data)
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    }
    fetchAdmins()
  }, [refreshUI])

  return (
    <div className='py-2 bg-white'>
      <AdminTable tabledata={tabledata} loading={loading} setRefreshUI={setRefreshUI} />
    </div>
  )
}

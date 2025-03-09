
import CustomersTable from '@/components/customers/CustomersTable'
import MeterReadersTable from '@/components/meter-reader/MeterReaderTable'
import { axiosClient } from '@/utils/axiosClient'

import React, { useEffect } from 'react'

export default function MeterReader() {
  const [tabledata, setTabledata] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [refreshUI, setRefreshUI] = React.useState<boolean>(false)

  useEffect(() => {
    const fetchMeterReader = async () => {
      try {
        setLoading(true)
        const res = await axiosClient.get('api/meter-reader/')
        setTabledata(res.data)
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    }
    fetchMeterReader()
  }, [refreshUI])

  return (
    <div className='py-2 bg-white'>
      <MeterReadersTable tabledata={tabledata} loading={loading} setRefreshUI={setRefreshUI} />
    </div>
  )
}

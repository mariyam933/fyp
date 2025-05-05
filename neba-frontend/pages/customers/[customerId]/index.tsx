import BillsTable from "@/components/bills/BillsTable";
import { axiosClient } from "@/utils/axiosClient";
import { useRouter } from "next/router";

import React, { useEffect } from "react";

export default function Bills() {
  const [tabledata, setTabledata] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [refreshUI, setRefreshUI] = React.useState<boolean>(false);
  const [customerData, setCustomerData] = React.useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch customer data
        const customerRes = await axiosClient.get(
          "api/customer/" + router.query.customerId
        );
        setCustomerData(customerRes.data);

        // Fetch bills
        const billsRes = await axiosClient.get(
          "api/bill/" + router.query.customerId
        );
        // Add customer name to each bill
        const billsWithCustomer = billsRes.data.map((bill: any) => ({
          ...bill,
          customerId: {
            ...bill.customerId,
            name: customerRes.data.name,
          },
        }));
        setTabledata(billsWithCustomer);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    if (router.query.customerId) {
      fetchData();
    }
  }, [refreshUI, router.query.customerId]);

  return (
    <div className="py-2 bg-white">
      <BillsTable
        tabledata={tabledata}
        loading={loading}
        setRefreshUI={setRefreshUI}
      />
    </div>
  );
}

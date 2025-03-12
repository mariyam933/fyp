import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/loader"
import { axiosClient } from "@/utils/axiosClient"
import { billValidate } from "@/utils/common"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"

export default function EditBillModal({
  billData,
  setRefreshUI,
  showModal,
  setShowModal,
}) {
  const [srNo, setSrNo] = useState("")
  const [unitsConsumed, setUnitsConsumed] = useState("")
  const [totalBill, setTotalBill] = useState("")
  const [meterSrNo, setMeterSrNo] = useState("")
  const [loading, setLoading] = useState(false)

  // Pre-fill fields when billData is available
  useEffect(() => {
    if (billData) {
      setUnitsConsumed(billData.unitsConsumed)
      setTotalBill(billData.totalBill)
      setMeterSrNo(billData.meterSrNo)
    }
  }, [billData])

  const editBill = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const errors = billValidate(unitsConsumed, totalBill, meterSrNo);
    if (!Object.keys(errors).length) {
      setLoading(true)
      try {
        await axiosClient.put(`/api/bill/${billData._id}`, {
          srNo,
          unitsConsumed,
          // totalBill,
          meterSrNo,
        })
        toast.success("Bill updated successfully")
        setRefreshUI((prev) => !prev)
        setShowModal(false)
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update bill")
      }
      setLoading(false)
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[425px] p-6" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Bill</DialogTitle>
          <DialogDescription>Update the bill details</DialogDescription>
        </DialogHeader>
        <form>
          <div className="py-4">
            <h2 className="font-medium mt-3">Current Reading</h2>
            <Input
              id="unitsConsumed"
              value={unitsConsumed}
              placeholder="100"

              onChange={(e) => setUnitsConsumed(e.target.value)}
              className="mt-2"
            />
            <h2 className="font-medium mt-3">Total Bill</h2>
            <Input
              id="totalBill"
              value={totalBill}
              readOnly
              placeholder="200"
              // onChange={(e) => setTotalBill(e.target.value)}
              className="mt-2 bg-gray-200 text-gray-500 cursor-not-allowed"
            />
            <h2 className="font-medium mt-3">Meter Serial Number</h2>
            <Input
              id="meterSrNo"
              value={meterSrNo}
              readOnly
              placeholder="1234567890"
              // onChange={(e) => setMeterSrNo(e.target.value)}
              className="mt-2 bg-gray-200 text-gray-500 cursor-not-allowed"

            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
              onClick={editBill}
            >
              <Spinner size="xsmall" show={loading} className="text-white" />
              Save Changes
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              variant="outline"
              disabled={loading}
              type="button"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

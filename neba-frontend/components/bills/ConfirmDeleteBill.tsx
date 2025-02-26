import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/loader"
import { axiosClient } from "@/utils/axiosClient"
import { useState } from "react"
import toast from "react-hot-toast"

export default function ConfirmBillDeleteModal({
  setRefreshUI,
  showModal,
  setShowModal,
  billId,
}) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await axiosClient.delete(`/api/bill/${billId}`)
      toast.success("Bill deleted successfully")
      setRefreshUI((prev) => !prev)
      setShowModal(false)
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Something went wrong")
    }
    setLoading(false)
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="p-6" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="text-xl">Confirm Delete Bill</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this bill? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5">
          <Button variant="secondary" disabled={loading} onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="flex bg-red-500 hover:bg-red-500/90 items-center gap-x-2"
          >
            <Spinner size="xsmall" className="text-white" show={loading} />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

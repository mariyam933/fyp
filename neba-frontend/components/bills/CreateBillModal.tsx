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
import { useState } from "react"
import toast from "react-hot-toast"
import UploadImage from "./UploadImage"
import { useRouter } from "next/router"

export default function CreateBillModal({ setRefreshUI }) {
  const [file, setFile] = useState<File | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanResults, setScanResults] = useState<any>(null)

  const router = useRouter()
  console.log('router', router.query.customerId)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const scanBill = async () => {
    if (!file) {
      toast.error("Please upload a bill first.")
      return
    }

    setScanLoading(true)
    setTimeout(() => {
      // Simulate scanning process (this is where you would call an API for actual OCR or scanning)
      setScanResults({
        unitsConsumed: 150,
        totalBill: 250.75,
        meterSrNo: "1234567890",
      })
      setScanLoading(false)
    }, 5000) // 5 seconds delay to simulate loading
  }

  const createBill = async () => {
    if (!scanResults) {
      toast.error("Please scan the bill first.")
      return
    }

    setLoading(true)
    try {
      const data = {
        unitsConsumed: scanResults.unitsConsumed,
        totalBill: scanResults.totalBill,
        meterSrNo: scanResults.meterSrNo,
        customerId: router.query.customerId,
      }
      // Assuming you are sending this data to your backend
      await axiosClient.post("/api/bill", data)
      toast.success("Bill created successfully")
      setRefreshUI((prev) => !prev)
      setShowModal(false)
      // Reset the form
      setFile(null)
      setScanResults(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong")
    }
    setLoading(false)
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <Button
        onClick={() => setShowModal(true)}
        className="ml-auto text-sm border border-black"
      >
        Create Bill
      </Button>
      <DialogContent className="sm:max-w-[425px] p-6" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Create Meter Bill</DialogTitle>
          <DialogDescription>Upload and scan the bill</DialogDescription>
        </DialogHeader>
        <form>
          <div className="py-4">
            <h2 className="font-medium">Upload Bill</h2>
            {file ? <img src={URL.createObjectURL(file)} alt="Question" className="mt-2 w-[250px] max-h-[600px] border border-gray-200 rounded" /> :
              <UploadImage setImage={setFile} />
            }
            <div className="flex gap-2">
              <Button
                onClick={scanBill}
                size="sm"
                disabled={scanLoading || !file}
                className="mt-3"
              >
                {scanLoading ? (
                  <Spinner size="xsmall" show={scanLoading} className="text-white" />
                ) : (
                  "Scan Bill"
                )}
              </Button>
              {file &&
                <Button
                  onClick={() => setFile(null)}
                  variant="destructive"
                  type="button"
                  size="sm"
                  className="mt-3"
                > Clear Image </Button>
              }

            </div>

            {scanResults && (
              <div className="mt-4">
                <h3 className="font-medium">Scan Results</h3>
                <p>Units Consumed: {scanResults.unitsConsumed}</p>
                <p>Total Bill: ${scanResults.totalBill.toFixed(2)}</p>
                <p>Meter Serial No: {scanResults.meterSrNo}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || scanLoading || !scanResults}
              onClick={createBill}
              className="flex items-center gap-2"
            >
              <Spinner size="xsmall" show={loading} className="text-white" />
              Create Bill
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              variant="outline"
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

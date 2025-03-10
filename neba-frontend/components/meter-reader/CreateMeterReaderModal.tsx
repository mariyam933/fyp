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
import { meterReaderValidate } from "@/utils/common"
import { useState } from "react"
import toast from "react-hot-toast"

export default function CreateMeterReaderModal({ setRefreshUI }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const createMeterReader = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const errors = meterReaderValidate(name, email, address, phone);
    if (!Object.keys(errors).length) {
      setLoading(true)
      try {
        const res = await axiosClient.post('/api/meter-reader/', {
          name,
          email,
          address,
          phone,
        });
        toast.success('Meter Reader created successfully');
        setRefreshUI((pre) => !pre);
        setShowModal(false);
        // reset the form
        setName("");
        setEmail("");
        setAddress("");
        setPhone("");
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
      setLoading(false);
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <Button
        onClick={() => setShowModal(true)}
        className="ml-auto text-sm border border-black"
      >
        Create Meter Reader
      </Button>
      <DialogContent className="sm:max-w-[425px] p-6" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Create Meter Reader</DialogTitle>
          <DialogDescription>Enter the meter reader details</DialogDescription>
        </DialogHeader>
        <form>
          <div className="py-4">
            <h2 className="">Full Name</h2>
            <Input
              id="name"
              value={name}
              placeholder="John Doe"
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
            <h2 className="mt-3">Email</h2>
            <Input
              id="email"
              value={email}
              placeholder="john@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
            <h2 className="mt-3">Address</h2>
            <Input
              id="address"
              value={address}
              placeholder="123 Main Street"
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
            />
            <h2 className="mt-3">Phone</h2>
            <Input
              id="phone"
              value={phone}
              placeholder="+123456789"
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
           
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
              onClick={createMeterReader}
            >
              <Spinner size="xsmall" show={loading} className="text-white" />
              Create New Meter Reader
            </Button>
            {/* Cancel Button */}
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

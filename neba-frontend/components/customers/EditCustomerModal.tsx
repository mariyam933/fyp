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
import { customerValidate } from "@/utils/common"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"

export default function EditCustomerModal({
  customerData,
  setRefreshUI,
  showModal,
  setShowModal,
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [meterNo, setMeterNo] = useState("")
  const [loading, setLoading] = useState(false)

  // Pre-fill fields when customerData is available
  useEffect(() => {
    if (customerData) {
      setName(customerData.name)
      setEmail(customerData.email)
      setAddress(customerData.address)
      setPhone(customerData.phone)
      setMeterNo(customerData.meterNo)
    }
  }, [customerData])

  const editCustomer = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const errors = customerValidate(name, email, address, phone, meterNo)
    if (!Object.keys(errors).length) {
      setLoading(true)
      try {
        await axiosClient.put(`/api/customer/${customerData._id}`, {
          name,
          email,
          address,
          phone,
          meterNo,
        })
        toast.success("Customer updated successfully")
        setRefreshUI((prev) => !prev)
        setShowModal(false)
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update customer")
      }
      setLoading(false)
    }
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[425px] p-6" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>Update the customer details</DialogDescription>
        </DialogHeader>
        <form>
          <div className="py-4">
            <h2 className="font-medium">Full Name</h2>
            <Input
              id="name"
              value={name}
              placeholder="John Doe"
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
            <h2 className="font-medium mt-3">Email</h2>
            <Input
              id="email"
              value={email}
              placeholder="john@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
            />
            <h2 className="font-medium mt-3">Address</h2>
            <Input
              id="address"
              value={address}
              placeholder="123 Main Street"
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2"
            />
            <h2 className="font-medium mt-3">Phone</h2>
            <Input
              id="phone"
              value={phone}
              placeholder="+123456789"
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2"
            />
            <h2 className="font-medium mt-3">Meter Number</h2>
            <Input
              id="meterNo"
              value={meterNo}
              placeholder="1234567890"
              onChange={(e) => setMeterNo(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
              onClick={editCustomer}
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

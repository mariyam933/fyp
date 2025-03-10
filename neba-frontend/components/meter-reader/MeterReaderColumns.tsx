import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  ColumnDef,
} from "@tanstack/react-table"

import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/router"
import { useState } from "react"
import UpdateCustomerModal from "../customers/EditCustomerModal"
import ConfirmCustomerDeleteModal from "../customers/ConfirmDeleteCustomer"

interface getCol {
  setRefreshUI?: any
}

export const MeterReaderColumns = (options: getCol = {}): ColumnDef<any>[] => {
  const { setRefreshUI } = options
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Full Name
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="capitalize px-4">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="px-4">{row.getValue("email")}</div>,
    },
    // address
    {
      accessorKey: "address",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Address
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="px-4">{row.getValue("address")}</div>,
    },
    // phone
    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Phone
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className="px-4">{row.getValue("phone")}</div>,
    },
    
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const router = useRouter()
        const [showModal, setShowModal] = useState(false)
        // const [selectedAdmin, setSelectedAdmin] = useState(null)
        const [showEditModal, setShowEditModal] = useState(false)
        return (
          <>
          {/* delete not working for meter reader not yet implemented so that's why i ma commenting it*/}
            {/* <UpdateCustomerModal customerData={row.original} showModal={showEditModal} setShowModal={setShowEditModal} setRefreshUI={setRefreshUI} />
            <ConfirmCustomerDeleteModal setRefreshUI={setRefreshUI} showModal={showModal} setShowModal={setShowModal} customerId={row.original._id} /> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={(e) => setShowEditModal(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowModal(true)} className="!text-red-500 hover:!bg-red-50" >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )
      },
    },
  ]
}
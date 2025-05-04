import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ColumnDef } from "@tanstack/react-table";

import { ArrowUpDown, MoreHorizontal, Download } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import EditBillModal from "./EditBillModal";
import ConfirmBillDeleteModal from "./ConfirmDeleteBill";
import { jsPDF } from "jspdf";

interface getCol {
  setRefreshUI?: any;
}

export const billsColumns = (options: getCol = {}): ColumnDef<any>[] => {
  const { setRefreshUI } = options;
  return [
    {
      accessorKey: "meterSrNo",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bill Sr No
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize px-4">{row.getValue("meterSrNo")}</div>
      ),
    },
    {
      accessorKey: "totalBill",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="px-4">{row.getValue("totalBill")}</div>
      ),
    },
    // address
    {
      accessorKey: "unitsConsumed",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Units Consumed
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="px-4">{row.getValue("unitsConsumed")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="px-2 py-1 rounded-full font-medium bg-yellow-500 text-white text-center max-w-[80px]">
          Pending
        </div>
      ),
    },
    {
      accessorKey: "imageUrl",
      header: "Meter Reading",
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl;
        return imageUrl ? (
          <div className="flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Meter Reading"
              className="w-20 h-20 object-cover rounded border border-gray-200"
              onClick={() => window.open(imageUrl, "_blank")}
              style={{ cursor: "pointer" }}
            />
          </div>
        ) : (
          <div className="text-gray-400 text-center">No image</div>
        );
      },
    },
    {
      id: "download",
      header: "Download",
      cell: ({ row }) => {
        const handleDownload = async () => {
          const doc = new jsPDF();

          // Add title
          doc.setFontSize(20);
          doc.text("Electricity Bill", 105, 20, { align: "center" });

          // Add bill details
          doc.setFontSize(12);
          doc.text(`Bill Serial Number: ${row.original.meterSrNo}`, 20, 40);
          doc.text(`Units Consumed: ${row.original.unitsConsumed}`, 20, 50);
          doc.text(`Total Amount: Rs. ${row.original.totalBill}`, 20, 60);
          doc.text(`Status: ${row.original.status || "Pending"}`, 20, 70);

          // Add date
          doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);

          // Add image if available
          if (row.original.imageUrl) {
            try {
              // Add image title
              doc.text("Meter Reading Image:", 20, 100);

              // Load and add the image
              const img = new Image();
              img.src = row.original.imageUrl;

              // Wait for image to load
              await new Promise((resolve) => {
                img.onload = resolve;
              });

              // Add image to PDF (scaled to fit)
              const imgWidth = 100;
              const imgHeight = (img.height * imgWidth) / img.width;
              doc.addImage(img, "JPEG", 20, 110, imgWidth, imgHeight);
            } catch (error) {
              console.error("Error adding image to PDF:", error);
            }
          }

          // Save the PDF
          doc.save(`bill_${row.original.meterSrNo}.pdf`);
        };

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const router = useRouter();
        const [showModal, setShowModal] = useState(false);
        const [showEditModal, setShowEditModal] = useState(false);
        return (
          <>
            <EditBillModal
              billData={row.original}
              showModal={showEditModal}
              setShowModal={setShowEditModal}
              setRefreshUI={setRefreshUI}
            />
            <ConfirmBillDeleteModal
              setRefreshUI={setRefreshUI}
              showModal={showModal}
              setShowModal={setShowModal}
              billId={row.original._id}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onClick={(e) => e.stopPropagation()}
                align="end"
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={(e) => setShowEditModal(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowModal(true)}
                  className="!text-red-500 hover:!bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];
};

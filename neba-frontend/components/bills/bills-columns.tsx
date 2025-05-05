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

          doc.setProperties({
            title: `Bill ${row.original.meterSrNo}`,
            subject: "Electricity Bill",
            author: "NUST Electricity Billing System",
          });

          // Add NUST signature image
          const nustSignature = new Image();
          nustSignature.src = "/asset/images/NUST-Signature-01.png";
          await new Promise((resolve) => {
            nustSignature.onload = resolve;
          });
          doc.addImage(nustSignature, "PNG", 20, 10, 60, 30);

          if (row.original.imageUrl) {
            try {
              doc.setFontSize(12);
              doc.setFont("helvetica", "normal");
              doc.text("Meter Reading:", 150, 20, { align: "right" });

              const img = new Image();
              img.src = row.original.imageUrl;

              await new Promise((resolve) => {
                img.onload = resolve;
              });

              const imgWidth = 80;
              const imgHeight = (img.height * imgWidth) / img.width;
              doc.addImage(img, "JPEG", 110, 25, imgWidth, imgHeight);
            } catch (error) {
              console.error("Error adding image to PDF:", error);
            }
          }

          doc.setFontSize(24);
          doc.text("Electricity Bill", 20, row.original.imageUrl ? 50 : 45);
          doc.setFontSize(12);
          doc.text(
            `Bill No: ${row.original.meterSrNo}`,
            20,
            row.original.imageUrl ? 60 : 55
          );

          doc.setFontSize(14);
          doc.text("Customer Details", 20, row.original.imageUrl ? 80 : 50);
          doc.setFontSize(12);
          doc.text(
            `Name: ${row.original.customerId.name}`,
            20,
            row.original.imageUrl ? 90 : 60
          );
          doc.text(
            `Meter Serial Number: ${row.original.meterSrNo}`,
            20,
            row.original.imageUrl ? 100 : 70
          );

          doc.setFontSize(14);
          doc.text("Consumption Details", 20, row.original.imageUrl ? 120 : 90);
          doc.setFontSize(12);
          doc.text(
            `Total Units Consumed: ${row.original.unitsConsumed}`,
            20,
            row.original.imageUrl ? 130 : 100
          );

          doc.setFontSize(14);
          doc.text(
            "Bill Calculation Details",
            20,
            row.original.imageUrl ? 150 : 120
          );

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Component", 20, row.original.imageUrl ? 165 : 135);
          doc.text("Amount (Rs.)", 150, row.original.imageUrl ? 165 : 135, {
            align: "right",
          });

          doc.line(
            20,
            row.original.imageUrl ? 170 : 140,
            190,
            row.original.imageUrl ? 170 : 140
          );

          doc.setFont("helvetica", "normal");
          let y = row.original.imageUrl ? 180 : 150;

          const electricCost = row.original.unitsConsumed * 35;
          doc.text("Electric Cost", 20, y);
          doc.text(electricCost.toFixed(2), 150, y, { align: "right" });
          y += 10;

          const fc = row.original.unitsConsumed * 3.23;
          doc.text("Fuel Charges (FC)", 20, y);
          doc.text(fc.toFixed(2), 150, y, { align: "right" });
          y += 10;

          const qtrTax = row.original.unitsConsumed * 0.5;
          doc.text("Quarterly Tax (QTR)", 20, y);
          doc.text(qtrTax.toFixed(2), 150, y, { align: "right" });
          y += 10;

          const fpaRate = 0.1;
          const fpa = row.original.unitsConsumed * fpaRate;
          doc.text("Fuel Price Adjustment (FPA)", 20, y);
          doc.text(fpa.toFixed(2), 150, y, { align: "right" });
          y += 10;

          const fixedCharges = 1000;
          doc.text("Fixed Charges", 20, y);
          doc.text(fixedCharges.toFixed(2), 150, y, { align: "right" });
          y += 10;

          const ptvFee = 35;
          doc.text("PTV Fee", 20, y);
          doc.text(ptvFee.toFixed(2), 150, y, { align: "right" });
          y += 10;

          const meterRent = 25;
          doc.text("Meter Rent", 20, y);
          doc.text(meterRent.toFixed(2), 150, y, { align: "right" });
          y += 10;

          const waterBill = 250;
          doc.text("Water Bill", 20, y);
          doc.text(waterBill.toFixed(2), 150, y, { align: "right" });
          y += 10;

          const subtotal =
            electricCost +
            fc +
            qtrTax +
            fpa +
            fixedCharges +
            ptvFee +
            meterRent +
            waterBill;
          doc.setFont("helvetica", "bold");
          doc.text("Subtotal", 20, y);
          doc.text(subtotal.toFixed(2), 150, y, { align: "right" });
          y += 10;

          const gstBase = electricCost + fc + qtrTax;
          const gst = gstBase * 0.18;
          doc.text("GST (18%)", 20, y);
          doc.text(gst.toFixed(2), 150, y, { align: "right" });
          y += 10;

          doc.line(20, y, 190, y);

          const totalAmount = subtotal + gst;
          doc.setFont("helvetica", "bold");
          doc.text("Total Amount", 20, y + 10);
          doc.text(totalAmount.toFixed(2), 150, y + 10, { align: "right" });

          doc.setFont("helvetica", "normal");
          doc.text(
            `Billing Date: ${new Date(
              row.original.createdAt
            ).toLocaleDateString()}`,
            20,
            y + 30
          );
          doc.text(
            `Due Date: ${new Date(row.original.dueDate).toLocaleDateString()}`,
            20,
            y + 40
          );

          // Adjust text positions
          doc.setFont("helvetica", "bold");
          doc.text("Payment Instructions:", 20, y + 60);
          doc.setFont("helvetica", "normal");
          doc.text(
            "1. Please pay the bill before the due date to avoid late payment charges.",
            20,
            y + 70
          );
          doc.text(
            "2. Payment can be made through bank transfer or at our office.",
            20,
            y + 80
          );
          doc.text(
            "3. For any queries, please contact our customer service.",
            20,
            y + 90
          );

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

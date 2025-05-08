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
import { axiosClient } from "@/utils/axiosClient";
import { toast } from "react-hot-toast";

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
          try {
            // Log the bill data from the database
            console.log("Bill Data from Database:", {
              meterSrNo: row.original.meterSrNo,
              customerName: row.original.customerId.name,
              unitsConsumed: row.original.unitsConsumed,
              totalBill: row.original.totalBill,
              imageUrl: row.original.imageUrl,
              customerId: row.original.customerId,
            });

            // Fetch current settings
            const settingsResponse = await axiosClient.get("/api/settings");
            const settings = settingsResponse.data;

            // Log the settings data
            console.log("Settings Data:", settings);

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

            doc.setFontSize(20);
            doc.setTextColor(0, 0, 255); // Blue color for title
            doc.text("Electricity Bill", 20, row.original.imageUrl ? 50 : 45);

            doc.setFontSize(10);
            doc.setTextColor(255, 0, 0); // Red color for bill number
            doc.text(
              `Bill No: ${row.original.meterSrNo}`,
              20,
              row.original.imageUrl ? 60 : 55
            );

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 139); // Dark blue for section headers
            doc.text("Customer Details", 20, row.original.imageUrl ? 70 : 60);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0); // Black for regular text
            doc.text(
              `Name: ${row.original.customerId.name}`,
              20,
              row.original.imageUrl ? 80 : 70
            );
            doc.text(
              `Meter Serial Number: ${row.original.meterSrNo}`,
              20,
              row.original.imageUrl ? 90 : 80
            );

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 139); // Dark blue for section headers
            doc.text(
              "Consumption Details",
              20,
              row.original.imageUrl ? 100 : 90
            );
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0); // Black for regular text
            doc.text(
              `Total Units Consumed: ${row.original.unitsConsumed}`,
              20,
              row.original.imageUrl ? 110 : 100
            );

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 139); // Dark blue for section headers
            doc.text(
              "Bill Calculation Details",
              20,
              row.original.imageUrl ? 120 : 110
            );

            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 0, 0); // Dark red for column headers
            doc.text("Component", 20, row.original.imageUrl ? 130 : 120);
            doc.text("Amount (Rs.)", 150, row.original.imageUrl ? 130 : 120, {
              align: "right",
            });

            doc.setDrawColor(0, 0, 255); // Blue color for lines
            doc.line(
              20,
              row.original.imageUrl ? 135 : 125,
              190,
              row.original.imageUrl ? 135 : 125
            );

            doc.setFont("helvetica", "normal");
            let y = row.original.imageUrl ? 145 : 135;

            const lineSpacing = 8;

            const electricCost =
              row.original.unitsConsumed * settings.unitPrice;
            const fc = row.original.unitsConsumed * settings.fcRate;
            const qtrTax = row.original.unitsConsumed * settings.qtrRate;
            const fpa = row.original.unitsConsumed * settings.fpaRate;
            const subtotal =
              electricCost +
              fc +
              qtrTax +
              fpa +
              settings.fixedCharges +
              settings.ptvFee +
              settings.meterRent +
              settings.waterBill;
            const gstBase = electricCost + fc + qtrTax;
            const gst = gstBase * settings.gstRate;
            const totalAmount = subtotal + gst;

            // Regular charges in black
            doc.setTextColor(0, 0, 0);
            doc.text("Electric Cost", 20, y);
            doc.text(electricCost.toFixed(2), 150, y, { align: "right" });
            y += lineSpacing;

            doc.text("Fuel Charges (FC)", 20, y);
            doc.text(fc.toFixed(2), 150, y, { align: "right" });
            y += lineSpacing;

            doc.text("Quarterly Tax (QTR)", 20, y);
            doc.text(qtrTax.toFixed(2), 150, y, { align: "right" });
            y += lineSpacing;

            doc.text("Fuel Price Adjustment (FPA)", 20, y);
            doc.text(fpa.toFixed(2), 150, y, { align: "right" });
            y += lineSpacing;

            doc.text("Fixed Charges", 20, y);
            doc.text(settings.fixedCharges.toFixed(2), 150, y, {
              align: "right",
            });
            y += lineSpacing;

            doc.text("PTV Fee", 20, y);
            doc.text(settings.ptvFee.toFixed(2), 150, y, { align: "right" });
            y += lineSpacing;

            doc.text("Meter Rent", 20, y);
            doc.text(settings.meterRent.toFixed(2), 150, y, { align: "right" });
            y += lineSpacing;

            doc.text("Water Bill", 20, y);
            doc.text(settings.waterBill.toFixed(2), 150, y, { align: "right" });
            y += lineSpacing;

            // Subtotal in dark blue
            doc.setTextColor(0, 0, 139);
            doc.setFont("helvetica", "bold");
            doc.text("Subtotal", 20, y);
            doc.text(subtotal.toFixed(2), 150, y, { align: "right" });
            y += lineSpacing;

            // GST in dark red
            doc.setTextColor(255, 0, 0);
            doc.text("GST (18%)", 20, y);
            doc.text(gst.toFixed(2), 150, y, { align: "right" });
            y += lineSpacing;

            doc.setDrawColor(0, 0, 255); // Blue color for lines
            doc.line(20, y, 190, y);

            // Total amount in dark blue and bold
            doc.setTextColor(0, 0, 139);
            doc.setFont("helvetica", "bold");
            doc.text("Total Amount", 20, y + 5);
            doc.text(totalAmount.toFixed(2), 150, y + 5, { align: "right" });

            // Dates in black
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            doc.text(
              `Billing Date: ${new Date().toLocaleDateString()}`,
              20,
              y + 15
            );
            doc.text(
              `Due Date: ${new Date(
                Date.now() + 10 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()}`,
              20,
              y + 23
            );

            // Payment instructions in dark blue
            doc.setTextColor(0, 0, 139);
            doc.setFont("helvetica", "bold");
            doc.text("Payment Instructions:", 20, y + 35);
            doc.setFont("helvetica", "normal");
            doc.text(
              "1. Please pay the bill before the due date to avoid late payment charges.",
              20,
              y + 43
            );
            doc.text(
              "2. Payment can be made through bank transfer or at our office.",
              20,
              y + 51
            );
            doc.text(
              "3. For any queries, please contact our customer service.",
              20,
              y + 59
            );

            doc.save(`bill_${row.original.meterSrNo}.pdf`);
          } catch (error) {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF");
          }
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

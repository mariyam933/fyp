import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loader";
import { axiosClient } from "@/utils/axiosClient";
import { useState } from "react";
import toast from "react-hot-toast";
import UploadImage from "./UploadImage";
import { useRouter } from "next/router";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";

export default function CheckBillModal({ setRefreshUI }) {
  const [file, setFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [latestBill, setLatestBill] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchLatestBill = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(
          "api/bill/" + router.query.customerId
        );
        if (res.data && res.data.length > 0) {
          const latest = res.data[res.data.length - 1];
          setLatestBill(latest);
          setCustomerData(latest.customerId);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch latest bill information");
      }
      setLoading(false);
    };
    if (router.query.customerId) {
      fetchLatestBill();
    }
  }, [router.query.customerId]);

  const scanBill = async () => {
    if (!file) {
      toast.error("Please upload a bill first.");
      return;
    }

    setScanLoading(true);

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result.split(",")[1]); // Remove "data:image/png;base64,"
          } else {
            reject(new Error("FileReader result is not a string"));
          }
        };
        reader.onerror = reject;
      });

    try {
      const base64Image = await toBase64(file);
      console.log("Image is as", base64Image);

      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      };

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBEiQDIcXhStgzDIsiT094waRwcMHXf9Zc`,

        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      console.log("Data is as", data);

      if (data.responses && data.responses[0].textAnnotations) {
        const formattedText = data.responses[0].textAnnotations[0].description;

        // Ensure each new value is on a new line
        const extractedText = formattedText.replace(/\s+/g, "\n");

        console.log("Extracted is as", extractedText);

        // const extractedKWh = extractedText.match(/(\d+)\s*kWh/i)?.[1] || "Unknown";
        //         const numbers = extractedText.match(/\d+/g)?.map(Number) || [];

        // const largestNumber = numbers.length > 0 ? Math.max(...numbers) : "Unknown";

        // console.log("Largest Number:", largestNumber)
        const numbers =
          extractedText
            .match(/\b\d+\b/g) // Match standalone numbers
            ?.map((num) => Number(num)) || []; // Convert to numbers

        // List of years to ignore
        const ignoredYears = new Set([
          2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
          2021, 2022, 2023, 2024,
        ]);

        // Filter out ignored years
        const validNumbers = numbers.filter((num) => !ignoredYears.has(num));

        // Find the largest valid number
        let largestNumber: number | string =
          validNumbers.length > 0 ? Math.max(...validNumbers) : "Unknown";

        if (
          extractedText.includes("THREE") &&
          typeof largestNumber === "number"
        ) {
          largestNumber = Math.floor(largestNumber / 100);
        }

        const parsedData = {
          unitsConsumed: largestNumber,
          totalBill: parseFloat(extractedText.match(/\d+\.\d+/)?.[0]) || 0.0,
          meterSrNo: router.query.meterNo,
        };

        setScanResults(parsedData);
      } else {
        toast.error("No text detected in the bill.");
      }
    } catch (error) {
      console.error("Error scanning bill:", error);
      toast.error("Failed to process bill.");
    }

    setScanLoading(false);
  };

  const downloadPDF = async () => {
    if (!scanResults) {
      toast.error("Please scan the bill first");
      return;
    }

    setPdfLoading(true);
    try {
      // Fetch current settings
      const settingsResponse = await axiosClient.get("/api/settings");
      const settings = settingsResponse.data;

      const doc = new jsPDF();

      doc.setProperties({
        title: `Bill ${latestBill.meterSrNo}`,
        subject: "Electricity Bill",
        author: "NUST Electricity Billing System",
      });

      // Add NUST signature image
      const nustSignature = new Image();
      nustSignature.src = "/asset/images/NUST-Signature-01.png";
      await new Promise((resolve) => {
        nustSignature.onload = resolve;
      });
      doc.addImage(nustSignature, "PNG", 20, 5, 60, 25);

      if (file) {
        try {
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          doc.text("Meter Reading:", 150, 15, { align: "right" });

          const img = new Image();
          img.src = URL.createObjectURL(file);

          await new Promise((resolve) => {
            img.onload = resolve;
          });

          const imgWidth = 70;
          const imgHeight = (img.height * imgWidth) / img.width;
          doc.addImage(img, "JPEG", 110, 20, imgWidth, imgHeight);
        } catch (error) {
          console.error("Error adding image to PDF:", error);
        }
      }

      doc.setFontSize(20);
      doc.setTextColor(0, 0, 255); // Blue color for title
      doc.text("Electricity Bill", 20, file ? 40 : 35);

      doc.setFontSize(10);
      doc.setTextColor(255, 0, 0); // Red color for bill number
      doc.text(
        `Bill No: ${latestBill?.meterSrNo || "N/A"}`,
        20,
        file ? 48 : 43
      );

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 139); // Dark blue for section headers
      doc.text("Customer Details", 20, file ? 56 : 51);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Black for regular text
      doc.text(`Name: ${customerData?.name || "N/A"}`, 20, file ? 64 : 59);
      doc.text(
        `Meter Serial Number: ${latestBill?.meterSrNo || "N/A"}`,
        20,
        file ? 72 : 67
      );

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 139); // Dark blue for section headers
      doc.text("Consumption Details", 20, file ? 80 : 75);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Black for regular text
      doc.text(
        `Previous Reading: ${latestBill?.unitsConsumed || 0}`,
        20,
        file ? 88 : 83
      );
      doc.text(
        `Current Reading: ${scanResults.unitsConsumed}`,
        20,
        file ? 96 : 91
      );
      doc.text(
        `Total Units Consumed: ${
          scanResults.unitsConsumed - (latestBill?.unitsConsumed || 0)
        }`,
        20,
        file ? 104 : 99
      );

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 139); // Dark blue for section headers
      doc.text("Bill Calculation Details", 20, file ? 112 : 107);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 0, 0); // Dark red for column headers
      doc.text("Component", 20, file ? 120 : 115);
      doc.text("Amount (Rs.)", 150, file ? 120 : 115, { align: "right" });

      doc.setDrawColor(0, 0, 255); // Blue color for lines
      doc.line(20, file ? 125 : 120, 190, file ? 125 : 120);

      doc.setFont("helvetica", "normal");
      let y = file ? 133 : 128;

      const lineSpacing = 6;
      const unitsConsumed =
        scanResults.unitsConsumed - (latestBill?.unitsConsumed || 0);

      const electricCost = unitsConsumed * settings.unitPrice;
      const fc = unitsConsumed * settings.fcRate;
      const qtrTax = unitsConsumed * settings.qtrRate;
      const fpa = unitsConsumed * settings.fpaRate;
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
      doc.text(settings.fixedCharges.toFixed(2), 150, y, { align: "right" });
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
      doc.text(`Billing Date: ${new Date().toLocaleDateString()}`, 20, y + 10);
      doc.text(
        `Due Date: ${new Date(
          Date.now() + 10 * 24 * 60 * 60 * 1000
        ).toLocaleDateString()}`,
        20,
        y + 18
      );

      // Payment instructions in dark blue
      doc.setTextColor(0, 0, 139);
      doc.setFont("helvetica", "bold");
      doc.text("Payment Instructions:", 20, y + 28);
      doc.setFont("helvetica", "normal");
      doc.text(
        "1. Please pay the bill before the due date to avoid late payment charges.",
        20,
        y + 34
      );
      doc.text(
        "2. Payment can be made through bank transfer or at our office.",
        20,
        y + 40
      );
      doc.text(
        "3. For any queries, please contact our customer service.",
        20,
        y + 46
      );

      doc.save(
        `bill_${latestBill?.meterSrNo || "N/A"}_${new Date().getTime()}.pdf`
      );
      toast.success("Bill downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
    setPdfLoading(false);
  };

  //   const createBill = async () => {
  //     if (!scanResults) {
  //       toast.error("Please scan the bill first.")
  //       return
  //     }

  //     setLoading(true)
  //     try {
  //       const data = {
  //         currentReading: scanResults.unitsConsumed,
  //         totalBill: scanResults.totalBill,
  //         meterSrNo: router.query.meterNo,
  //         customerId: router.query.customerId,
  //       }
  //       // Assuming you are sending this data to your backend
  //       await axiosClient.post("/api/bill", data)
  //       toast.success("Bill created successfully")
  //       setRefreshUI((prev) => !prev)
  //       setShowModal(false)
  //       // Reset the form
  //       setFile(null)
  //       setScanResults(null)
  //     } catch (error) {
  //       toast.error(error.response?.data?.message || "Something went wrong")
  //     }
  //     setLoading(false)
  //   }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <Button
        onClick={() => setShowModal(true)}
        className="ml-auto text-sm border border-black"
      >
        Check Current Bill
      </Button>
      <DialogContent
        className="sm:max-w-[425px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Check Current Consumption</DialogTitle>
          <DialogDescription>Upload and scan the meter</DialogDescription>
        </DialogHeader>
        <form>
          <div className="py-4">
            {file ? (
              <img
                src={URL.createObjectURL(file)}
                alt="Question"
                className="mt-2 w-[250px] max-h-[600px] border border-gray-200 rounded"
              />
            ) : (
              <UploadImage setImage={setFile} />
            )}
            <div className="flex gap-2">
              <Button
                onClick={scanBill}
                size="sm"
                disabled={scanLoading || !file}
                className="mt-3"
              >
                {scanLoading ? (
                  <Spinner
                    size="xsmall"
                    show={scanLoading}
                    className="text-white"
                  />
                ) : (
                  "Scan Meter"
                )}
              </Button>
              {file && (
                <Button
                  onClick={() => setFile(null)}
                  variant="destructive"
                  type="button"
                  size="sm"
                  className="mt-3"
                >
                  {" "}
                  Clear Image{" "}
                </Button>
              )}
            </div>

            {scanResults && (
              <div className="mt-4">
                <h3 className="font-medium">Scan Results</h3>
                <p>
                  Meter Serial No: {latestBill?.meterSrNo || "Not available"}
                </p>
                <p>
                  Last Month's Units Consumed: {latestBill?.unitsConsumed || 0}
                </p>
                <p>This Month's Units Consumed: {scanResults.unitsConsumed}</p>
                {latestBill && (
                  <p>
                    Electricity Cost:{" "}
                    {(
                      (scanResults.unitsConsumed - latestBill.unitsConsumed) *
                      35
                    ).toLocaleString()}{" "}
                    PKR
                  </p>
                )}
                <Button
                  onClick={downloadPDF}
                  disabled={pdfLoading || !scanResults || !latestBill}
                  className="mt-4 flex items-center gap-2"
                >
                  {pdfLoading ? (
                    <Spinner
                      size="xsmall"
                      show={pdfLoading}
                      className="text-white"
                    />
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Full Bill
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            {/* <Button
              type="submit"
              disabled={loading || scanLoading || !scanResults}
              onClick={createBill}
              className="flex items-center gap-2"
            >
              <Spinner size="xsmall" show={loading} className="text-white" />
              Create Billssss
            </Button> */}
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
  );
}

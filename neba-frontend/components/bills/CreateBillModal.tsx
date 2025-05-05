import { Button } from "@/components/ui/button";
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
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import UploadImage from "./UploadImage";
import { useRouter } from "next/router";

export default function CreateBillModal({ setRefreshUI }) {
  const [file, setFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [unitPrice, setUnitPrice] = useState<number>(35);

  const router = useRouter();

  useEffect(() => {
    fetchUnitPrice();
  }, []);

  const fetchUnitPrice = async () => {
    try {
      const response = await axiosClient.get("/api/settings");
      setUnitPrice(response.data.unitPrice);
    } catch (error) {
      console.error("Error fetching unit price:", error);
      toast.error("Failed to load unit price");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // const scanBill = async () => {
  //   if (!file) {
  //     toast.error("Please upload a bill first.")
  //     return
  //   }

  //   setScanLoading(true)
  //   setTimeout(() => {
  //     // Simulate scanning process (this is where you would call an API for actual OCR or scanning)
  //     setScanResults({
  //       unitsConsumed: 150,
  //       totalBill: 250.75,
  //       meterSrNo: "1234567890",
  //     })
  //     setScanLoading(false)
  //   }, 5000) // 5 seconds delay to simulate loading
  // }

  const scanBill = async () => {
    if (!file) {
      toast.error("Please upload a bill first.");
      return;
    }

    setScanLoading(true);

    // Convert image to Base64
    // const toBase64 = (file) =>
    //   new Promise((resolve, reject) => {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);
    //     reader.onload = () => reader.result && resolve(reader.result.split(",")[1]); // Remove "data:image/png;base64,"
    //     reader.onerror = reject;
    //   });
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

        const ignoredYears = new Set([
          2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
          2021, 2022, 2023, 2024,
        ]);

        const validNumbers = numbers.filter((num) => !ignoredYears.has(num));

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

  const createBill = async () => {
    if (!scanResults) {
      toast.error("Please scan the bill first.");
      return;
    }

    setLoading(true);
    try {
      const optimizeAndConvertImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          const img = new Image();

          reader.onload = (e) => {
            if (typeof e.target?.result === "string") {
              img.src = e.target.result;

              img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                const maxWidth = 1200;
                const scale = Math.min(1, maxWidth / img.width);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                if (ctx) {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.8);
                  resolve(optimizedBase64);
                } else {
                  reject(new Error("Could not get canvas context"));
                }
              };

              img.onerror = () => reject(new Error("Failed to load image"));
            } else {
              reject(new Error("Invalid file data"));
            }
          };

          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
      };

      const imageBase64 = file ? await optimizeAndConvertImage(file) : null;

      const data = {
        currentReading: scanResults.unitsConsumed,
        totalBill: scanResults.totalBill,
        meterSrNo: router.query.meterNo,
        customerId: router.query.customerId,
        imageFile: imageBase64,
        unitPrice: unitPrice,
      };

      await axiosClient.post("/api/bill", data);
      toast.success("Bill created successfully");
      setRefreshUI((prev) => !prev);
      setShowModal(false);
      setFile(null);
      setScanResults(null);
      setUnitPrice(35);
    } catch (error) {
      console.error("Error creating bill:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <Button
        onClick={() => setShowModal(true)}
        className="ml-auto text-sm border border-black"
      >
        Create Bill
      </Button>
      <DialogContent
        className="sm:max-w-[425px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Create Meter Bill</DialogTitle>
          <DialogDescription>Upload and scan the bill</DialogDescription>
        </DialogHeader>
        <form>
          <div className="py-4">
            <h2 className="font-medium">Upload Bill</h2>
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
                  "Scan Bill"
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
              <div className="mt-4 p-4 border rounded-lg bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-24 h-24">
                    <img
                      src="/images/01.png"
                      alt="Signature"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {file && (
                    <div className="w-32 h-32">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Meter Reading"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-blue-600 text-center mb-4">
                  WATER BILL
                </h2>

                <div className="space-y-4">
                  <div className="border border-blue-600 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-600 mb-3">
                      Bill Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-blue-600">
                          <span className="font-semibold">Bill Number:</span>{" "}
                          {scanResults.billNumber || scanResults._id}
                        </p>
                        <p className="text-blue-600">
                          <span className="font-semibold">Customer Name:</span>{" "}
                          {scanResults.customerName}
                        </p>
                        <p className="text-blue-600">
                          <span className="font-semibold">
                            Meter Serial No:
                          </span>{" "}
                          {scanResults.meterSrNo}
                        </p>
                        <p className="text-blue-600">
                          <span className="font-semibold">
                            Previous Reading:
                          </span>{" "}
                          {scanResults.previousReading || "0"}
                        </p>
                        <p className="text-blue-600">
                          <span className="font-semibold">
                            Current Reading:
                          </span>{" "}
                          {scanResults.currentReading ||
                            scanResults.unitsConsumed}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-blue-600">
                          <span className="font-semibold">Units Consumed:</span>{" "}
                          {scanResults.unitsConsumed}
                        </p>
                        <p className="text-blue-600">
                          <span className="font-semibold">Unit Price:</span> Rs.{" "}
                          {scanResults.unitPrice || 35}
                        </p>
                        <p className="text-blue-600">
                          <span className="font-semibold">Total Amount:</span>{" "}
                          Rs. {scanResults.totalBill}
                        </p>
                        <p className="text-blue-600">
                          <span className="font-semibold">Due Date:</span>{" "}
                          {new Date(
                            scanResults.dueDate || new Date()
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p
                      className={`text-lg font-bold ${
                        scanResults.isPaid ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      Status: {scanResults.isPaid ? "PAID" : "UNPAID"}
                    </p>
                  </div>

                  <div className="text-center text-sm text-blue-600">
                    Generated on: {new Date().toLocaleDateString()}
                  </div>
                </div>
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
  );
}

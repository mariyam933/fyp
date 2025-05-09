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
  const [previousReading, setPreviousReading] = useState<number | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchUnitPrice();
    if (router.query.customerId) {
      fetchPreviousReading();
    }
  }, [router.query.customerId]);

  const fetchUnitPrice = async () => {
    try {
      const response = await axiosClient.get("/api/settings");
      setUnitPrice(response.data.unitPrice);
    } catch (error) {
      console.error("Error fetching unit price:", error);
      toast.error("Failed to load unit price");
    }
  };

  const fetchPreviousReading = async () => {
    try {
      console.log(
        "Fetching previous reading for customer:",
        router.query.customerId
      );
      const response = await axiosClient.get(
        `/api/bill/prev/${router.query.customerId}`
      );
      console.log("Previous reading response:", response.data);
      setPreviousReading(response.data.currentReading);
      console.log("Set previous reading to:", response.data.currentReading);
      setIsNewCustomer(false);
    } catch (error) {
      console.error("Error fetching previous reading:", error);
      setIsNewCustomer(true);
      setPreviousReading(null);
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

    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result.split(",")[1]);
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
        const extractedText = formattedText.replace(/\s+/g, "\n");
        console.log("Extracted is as", extractedText);

        const numbers =
          extractedText.match(/\b\d+\b/g)?.map((num) => Number(num)) || [];

        const ignoredYears = new Set([
          2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
          2021, 2022, 2023, 2024,
        ]);

        const validNumbers = numbers.filter((num) => !ignoredYears.has(num));
        let largestNumber =
          validNumbers.length > 0 ? Math.max(...validNumbers) : "Unknown";

        if (
          extractedText.includes("THREE") &&
          typeof largestNumber === "number"
        ) {
          largestNumber = Math.floor(largestNumber / 100);
        }

        const parsedData = {
          currentReading: largestNumber,
          meterSrNo: router.query.meterNo,
        };

        console.log("Scanned values:", parsedData);
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

    if (isNewCustomer && previousReading === null) {
      toast.error("Please enter the previous reading for new customer.");
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
        currentReading: scanResults.currentReading,
        previousReading: isNewCustomer ? previousReading : previousReading,
        meterSrNo: scanResults.meterSrNo || router.query.meterNo,
        customerId: router.query.customerId,
        imageFile: imageBase64,
        unitPrice: scanResults.unitPrice || unitPrice,
      };

      console.log("Sending to backend:", data);
      await axiosClient.post("/api/bill", data);
      toast.success("Bill created successfully");

      // Fetch the latest previous reading after creating the bill
      await fetchPreviousReading();

      setRefreshUI((prev) => !prev);
      setShowModal(false);
      setFile(null);
      setScanResults(null);
      setUnitPrice(35);
      setIsNewCustomer(false);
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
              <div className="mt-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-black mb-3">
                    Bill Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-black">
                        Meter Serial No:
                      </span>
                      <span className="text-black">
                        {scanResults.meterSrNo}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-black">
                        Previous Reading:
                      </span>
                      {isNewCustomer ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={
                              previousReading === null ? "" : previousReading
                            }
                            onChange={(e) =>
                              setPreviousReading(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value)
                              )
                            }
                            className="w-[170px] h-8"
                            min="0"
                            placeholder="Enter previous reading"
                          />
                        </div>
                      ) : (
                        <span className="text-black">
                          {previousReading !== null
                            ? previousReading
                            : "No previous reading"}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-black">
                        Current Reading:
                      </span>
                      <span className="text-black">
                        {scanResults.currentReading}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-black">
                        Units Consumed:
                      </span>
                      <span className="text-black">
                        {scanResults.currentReading - (previousReading || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-black">
                        Unit Price:
                      </span>
                      <span className="text-black">
                        Rs. {scanResults.unitPrice || unitPrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="font-medium text-black">
                        Total Electricity Cost:
                      </span>
                      <span className="text-black font-semibold">
                        Rs.{" "}
                        {(
                          (scanResults.currentReading -
                            (previousReading || 0)) *
                          (scanResults.unitPrice || unitPrice)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                loading ||
                scanLoading ||
                !scanResults ||
                (isNewCustomer && previousReading === null)
              }
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

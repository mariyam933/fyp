import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { axiosClient } from "@/utils/axiosClient";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

// Add these custom components after your imports
const Card = ({ className, children }) => (
  <div className={`bg-white border rounded-lg shadow-sm ${className || ''}`}>
    {children}
  </div>
);

const CardHeader = ({ className, children }) => (
  <div className={`p-4 border-b ${className || ''}`}>
    {children}
  </div>
);

const CardTitle = ({ className, children }) => (
  <h3 className={`text-lg font-medium ${className || ''}`}>
    {children}
  </h3>
);

const CardContent = ({ className, children }) => (
  <div className={`p-4 ${className || ''}`}>
    {children}
  </div>
);

const CardFooter = ({ className, children }) => (
  <div className={`p-4 border-t ${className || ''}`}>
    {children}
  </div>
);

// Custom Alert component
const CustomAlert = ({ variant, title, children }) => (
  <div className={`mt-4 p-4 border rounded-md ${
    variant === 'destructive' 
      ? 'bg-red-50 border-red-300 text-red-800' 
      : 'bg-blue-50 border-blue-300 text-blue-800'
  }`}>
    <h4 className="text-sm font-medium mb-1">{title}</h4>
    <div className="text-sm">{children}</div>
  </div>
);

interface MeterReading {
  isValid: boolean;
  peakPrevious: number | null;
  peakCurrent: number | null;
  offPeakPrevious: number | null;
  offPeakCurrent: number | null;
  rawText: string;
}

interface PeakOffPeakReading {
  previous: number;
  current: number;
  units: number;
}

interface BillCharges {
  electricCost: number;
  fuelCharge: number;
  qtrTax: number;
  fixedCharges: number;
  fpaCharge: number;
  electricityDuty: number;
  gst: number;
  ptvFee: number;
  meterRent: number;
  waterBill: number;
}

interface TariffRates {
  peakRate: number;
  offPeakRate: number;
  fcRate: number;
  qtrRate: number;
  fpaRate: number;
  gstRate: number;
}

interface BillDetails {
  meterReadings: {
    peak: PeakOffPeakReading;
    offPeak: PeakOffPeakReading;
    totalUnits: number;
  };
  charges: BillCharges;
  tariffRates: TariffRates;
  totalAmount: number;
  billingDate: string;
  dueDate: string;
}

interface UploadResult {
  success: boolean;
  readings?: MeterReading;
  billDetails?: BillDetails;
  imageUrl?: string;
  error?: string;
  imageQualityIssue?: string;
  rawText?: string;
}

interface EnhancedUploadImageProps {
  meterId?: string;
  onBillGenerated?: (billDetails: BillDetails) => void;
  onSaveBill?: (billData: any) => void;
  customerId?: string;
  setRefreshUI?: React.Dispatch<React.SetStateAction<boolean>>;
}

const EnhancedUploadImage: React.FC<EnhancedUploadImageProps> = ({
  meterId = '',
  onBillGenerated,
  onSaveBill,
  customerId,
  setRefreshUI,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [savingBill, setSavingBill] = useState<boolean>(false);
  const [imageValidation, setImageValidation] = useState<{valid: boolean, message?: string}>({valid: true});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image quality validation
  const validateImage = (file: File): {valid: boolean, message?: string} => {
    // Check file size (minimum 100KB to ensure it's not too small/low quality)
    if (file.size < 100 * 1024) {
      return {
        valid: false,
        message: "Image is too small and may be low quality. Please upload a clearer image."
      };
    }
    
    // Max size check (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        valid: false,
        message: "Image is too large. Maximum size is 10MB."
      };
    }
    
    return {valid: true};
  };

  // Dropzone configuration
  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // Validate image quality
      const validation = validateImage(selectedFile);
      setImageValidation(validation);
      
      if (!validation.valid) {
        toast.error(validation.message || "Invalid image");
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      // Reset any previous results
      setResult(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
    },
    onDrop,
    maxFiles: 1,
    multiple: false,
  });

  const clearSelectedFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setImageValidation({valid: true});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file || !imageValidation.valid) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('meterImage', file);
    
    if (meterId) {
      formData.append('meterId', meterId);
    }
    
    try {
      const response = await axiosClient.post('/api/meter-readings/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setResult(response.data);
        if (response.data.billDetails && onBillGenerated) {
          onBillGenerated(response.data.billDetails);
          toast.success("Bill calculated successfully!");
        }
      } else if (response.data.imageQualityIssue) {
        // Handle image quality issues separately
        toast.error(response.data.imageQualityIssue);
        setResult({
          success: false,
          imageQualityIssue: response.data.imageQualityIssue,
          error: "Image quality issue. Please try a clearer photo."
        });
      } else {
        toast.error("Failed to extract readings from image");
        setResult({
          success: false,
          error: response.data.error || "Could not process this meter image. Please try a different photo with better lighting and focus."
        });
      }
    } catch (error) {
      console.error('Error uploading meter image:', error);
      toast.error("Failed to process meter image");
      setResult({
        success: false,
        error: 'Network or server error. Please try again later.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBill = async () => {
    if (!result?.success || !result.billDetails || !result.readings) return;
    
    setSavingBill(true);
    
    try {
      const billData = {
        customerId,
        meterId,
        readings: result.readings,
        billDetails: result.billDetails,
        imageUrl: result.imageUrl,
      };
      
      const response = await axiosClient.post('/api/meter-readings/save-bill', billData);
      
      if (response.data.success) {
        if (onSaveBill) {
          onSaveBill(billData);
        }
        if (setRefreshUI) {
          setRefreshUI(prev => !prev);
        }
        toast.success("Bill saved successfully");
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      toast.error("Failed to save bill");
    } finally {
      setSavingBill(false);
    }
  };

  const renderImageQualityGuidelines = () => (
    <CustomAlert title="Tips for Better Meter Image Recognition" variant="info">
      <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
        <li>Ensure good lighting with no glare on the meter display</li>
        <li>Keep the camera steady and capture a clear, focused image</li> 
        <li>Include the entire meter display in the frame</li>
        <li>Avoid shadows or finger coverage of any digits</li>
        <li>Clean the meter display if it's dusty</li>
      </ul>
    </CustomAlert>
  );

  const renderBillDetails = () => {
    if (!result?.success || !result.billDetails) return null;
    
    const { billDetails } = result;
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Bill Calculation Results</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.print()}
              >
                Print
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                // Download functionality would be implemented here
              >
                Download PDF
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSaveBill}
                disabled={savingBill || !customerId}
                className="flex items-center gap-2"
              >
                <Spinner size="xsmall" show={savingBill} className="text-white" />
                Save Bill
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meter Readings Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meter Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Previous</p>
                    <p className="font-medium">{billDetails.meterReadings.peak.previous.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Current</p>
                    <p className="font-medium">{billDetails.meterReadings.peak.current.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Off-Peak Previous</p>
                    <p className="font-medium">{billDetails.meterReadings.offPeak.previous.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Off-Peak Current</p>
                    <p className="font-medium">{billDetails.meterReadings.offPeak.current.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Units</p>
                    <p className="font-medium">{billDetails.meterReadings.peak.units.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Off-Peak Units</p>
                    <p className="font-medium">{billDetails.meterReadings.offPeak.units.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold text-primary">
                    Total Units: {billDetails.meterReadings.totalUnits.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Tariff Rates Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Applied Tariff Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Rate</p>
                    <p className="font-medium">Rs. {billDetails.tariffRates.peakRate.toFixed(2)}/kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Off-Peak Rate</p>
                    <p className="font-medium">Rs. {billDetails.tariffRates.offPeakRate.toFixed(2)}/kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Charge Rate</p>
                    <p className="font-medium">Rs. {billDetails.tariffRates.fcRate.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">QTR Rate</p>
                    <p className="font-medium">Rs. {billDetails.tariffRates.qtrRate.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">FPA Rate</p>
                    <p className="font-medium">Rs. {billDetails.tariffRates.fpaRate.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GST Rate</p>
                    <p className="font-medium">{(billDetails.tariffRates.gstRate * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charges Breakdown */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Charges Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Electric Cost</span>
                    <span className="font-medium">Rs. {billDetails.charges.electricCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fuel Charge</span>
                    <span className="font-medium">Rs. {billDetails.charges.fuelCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">QTR Tax</span>
                    <span className="font-medium">Rs. {billDetails.charges.qtrTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fixed Charges</span>
                    <span className="font-medium">Rs. {billDetails.charges.fixedCharges.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">FPA Charge</span>
                    <span className="font-medium">Rs. {billDetails.charges.fpaCharge.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Electricity Duty</span>
                    <span className="font-medium">Rs. {billDetails.charges.electricityDuty.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">GST</span>
                    <span className="font-medium">Rs. {billDetails.charges.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">PTV Fee</span>
                    <span className="font-medium">Rs. {billDetails.charges.ptvFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Meter Rent</span>
                    <span className="font-medium">Rs. {billDetails.charges.meterRent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Water Bill</span>
                    <span className="font-medium">Rs. {billDetails.charges.waterBill.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted rounded-b-lg">
              <div className="w-full flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-lg font-bold text-primary">
                  Rs. {billDetails.totalAmount.toFixed(2)}
                </span>
              </div>
            </CardFooter>
          </Card>
          
          {/* Billing Dates */}
          <div className="mt-6 flex flex-col md:flex-row justify-between gap-4">
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Billing Date</span>
                  <span className="font-medium">
                    {new Date(billDetails.billingDate).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Due Date</span>
                  <span className="font-medium">
                    {new Date(billDetails.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Meter Reading</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a clear image of the digital meter to automatically extract readings and calculate the bill.
          </p>
          
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5"}
              ${preview ? "pt-2" : ""}
              ${!imageValidation.valid ? "border-destructive bg-destructive/5" : ""}
            `}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            
            {!preview ? (
              <div className="py-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                    <line x1="16" x2="22" y1="5" y2="5"></line>
                    <line x1="19" x2="19" y1="2" y2="8"></line>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1">Drag & drop an image here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, HEIC files</p>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelectedFile();
                  }}
                  className="absolute -top-3 -right-3 bg-background rounded-full p-1 shadow-md hover:bg-muted transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <img 
                  src={preview} 
                  alt="Meter preview" 
                  className="max-h-[200px] mx-auto rounded-md my-2" 
                />
              </div>
            )}
          </div>
          
          {!imageValidation.valid && (
  <CustomAlert variant="destructive" title="Image Quality Issue">
    {imageValidation.message}
  </CustomAlert>
)}
          
          {result && !result.success && (
  <CustomAlert 
    variant="destructive" 
    title={result.imageQualityIssue ? "Image Quality Issue" : "Processing Error"}
  >
    {result.error || "Failed to process the meter image. Please try a clearer photo."}
  </CustomAlert>
)}
          
          {!result?.success && renderImageQualityGuidelines()}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleUpload}
            disabled={!file || uploading || !imageValidation.valid}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Spinner size="xsmall" show={uploading} className="text-white" />
            {uploading ? "Processing..." : "Process Meter Reading"}
          </Button>
        </CardFooter>
      </Card>
      
      {renderBillDetails()}
    </div>
  );
};

export default EnhancedUploadImage;Failed to process manual readings. Please check your inputs and try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleManualReadingChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualReadings({
      ...manualReadings,
      [field]: e.target.value,
    });
  };

  const handleSaveBill = async () => {
    if (!result?.success || !result.billDetails || !result.readings) return;
    
    setSavingBill(true);
    
    try {
      const billData = {
        customerId,
        meterId,
        readings: result.readings,
        billDetails: result.billDetails,
        imageUrl: result.imageUrl,
      };
      
      const response = await axiosClient.post('/api/meter-readings/save-bill', billData);
      
      if (response.data.success) {
        if (onSaveBill) {
          onSaveBill(billData);
        }
        if (setRefreshUI) {
          setRefreshUI(prev => !prev);
        }
        toast.success("Bill saved successfully");
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      toast.error("Failed to save bill");
    } finally {
      setSavingBill(false);
    }
  };

  const renderManualReadingsDialog = () => (
    <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enter Meter Readings Manually</DialogTitle>
          <DialogDescription>
            Please enter the previous and current readings for both peak and off-peak meters
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="peakPrevious">Previous Peak Reading</Label>
            <Input
              id="peakPrevious"
              type="number"
              step="0.01"
              min="0"
              value={manualReadings.peakPrevious}
              onChange={handleManualReadingChange('peakPrevious')}
              placeholder="e.g. 2507"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="peakCurrent">Current Peak Reading</Label>
            <Input
              id="peakCurrent"
              type="number"
              step="0.01"
              min="0"
              value={manualReadings.peakCurrent}
              onChange={handleManualReadingChange('peakCurrent')}
              placeholder="e.g. 2569"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="offPeakPrevious">Previous Off-Peak Reading</Label>
            <Input
              id="offPeakPrevious"
              type="number"
              step="0.01"
              min="0"
              value={manualReadings.offPeakPrevious}
              onChange={handleManualReadingChange('offPeakPrevious')}
              placeholder="e.g. 11367"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="offPeakCurrent">Current Off-Peak Reading</Label>
            <Input
              id="offPeakCurrent"
              type="number"
              step="0.01"
              min="0"
              value={manualReadings.offPeakCurrent}
              onChange={handleManualReadingChange('offPeakCurrent')}
              placeholder="e.g. 11658"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowManualDialog(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleManualReadingSubmit}
            disabled={
              !manualReadings.peakPrevious || 
              !manualReadings.peakCurrent || 
              !manualReadings.offPeakPrevious || 
              !manualReadings.offPeakCurrent ||
              uploading
            }
            className="flex items-center gap-2"
          >
            <Spinner size="xsmall" show={uploading} className="text-white" />
            Calculate Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderBillDetails = () => {
    if (!result?.success || !result.billDetails) return null;
    
    const { billDetails } = result;
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Bill Calculation Results</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.print()}
              >
                Print
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                // Download functionality would be implemented here
              >
                Download PDF
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSaveBill}
                disabled={savingBill || !customerId}
                className="flex items-center gap-2"
              >
                <Spinner size="xsmall" show={savingBill} className="text-white" />
                Save Bill
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meter Readings Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meter Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Previous</p>
                    <p className="font-medium">{billDetails.meterReadings.peak.previous.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Current</p>
                    <p className="font-medium">{billDetails.meterReadings.peak.current.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Off-Peak Previous</p>
                    <p className="font-medium">{billDetails.meterReadings.offPeak.previous.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Off-Peak Current</p>
                    <p className="font-medium">{billDetails.meterReadings.offPeak.current.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Units</p>
                    <p className="font-medium">{billDetails.meterReadings.peak.units.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Off-Peak Units</p>
                    <p className="font-medium">{billDetails.meterReadings.offPeak.units.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold text-primary">
                    Total Units: {billDetails.meterReadings.totalUnits.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Tariff Rates Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Applied Tariff Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Peak Rate</p>
                    <p className="font-medium">Rs. {billDetails.tariffRates.peakRate.toFixed(2)}/kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Off-Peak Rate</p>
                    <p className="font-medium">Rs. {billDetails.tariffRates.offPeakRate.toFixed(2)}/kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Charge Rate</p>
                    <p className="font-medium">Rs. {billDetails.tariffRates.fcRate.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">QTR Rate</p>
                    <p className="font-medium">Rs. {billDetails.tariffRates.qtrRate.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">FPA Rate</p>
                    <p className="font-medium">Rs. {billDetails.tariffRates.fpaRate.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GST Rate</p>
                    <p className="font-medium">{(billDetails.tariffRates.gstRate * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charges Breakdown */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Charges Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Electric Cost</span>
                    <span className="font-medium">Rs. {billDetails.charges.electricCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fuel Charge</span>
                    <span className="font-medium">Rs. {billDetails.charges.fuelCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">QTR Tax</span>
                    <span className="font-medium">Rs. {billDetails.charges.qtrTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fixed Charges</span>
                    <span className="font-medium">Rs. {billDetails.charges.fixedCharges.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">FPA Charge</span>
                    <span className="font-medium">Rs. {billDetails.charges.fpaCharge.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Electricity Duty</span>
                    <span className="font-medium">Rs. {billDetails.charges.electricityDuty.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">GST</span>
                    <span className="font-medium">Rs. {billDetails.charges.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">PTV Fee</span>
                    <span className="font-medium">Rs. {billDetails.charges.ptvFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Meter Rent</span>
                    <span className="font-medium">Rs. {billDetails.charges.meterRent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Water Bill</span>
                    <span className="font-medium">Rs. {billDetails.charges.waterBill.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted rounded-b-lg">
              <div className="w-full flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-lg font-bold text-primary">
                  Rs. {billDetails.totalAmount.toFixed(2)}
                </span>
              </div>
            </CardFooter>
          </Card>
          
          {/* Billing Dates */}
          <div className="mt-6 flex flex-col md:flex-row justify-between gap-4">
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Billing Date</span>
                  <span className="font-medium">
                    {new Date(billDetails.billingDate).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Due Date</span>
                  <span className="font-medium">
                    {new Date(billDetails.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Meter Reading</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a clear image of the digital meter to automatically extract readings and calculate the bill.
          </p>
          
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5"}
              ${preview ? "pt-2" : ""}
            `}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            
            {!preview ? (
              <div className="py-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                    <line x1="16" x2="22" y1="5" y2="5"></line>
                    <line x1="19" x2="19" y1="2" y2="8"></line>
                    <circle cx="9" cy="9" r="2"></circle>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1">Drag & drop an image here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, HEIC files</p>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelectedFile();
                  }}
                  className="absolute -top-3 -right-3 bg-background rounded-full p-1 shadow-md hover:bg-muted transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <img 
                  src={preview} 
                  alt="Meter preview" 
                  className="max-h-[200px] mx-auto rounded-md my-2" 
                />
              </div>
            )}
          </div>
          
          {result && !result.success && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Processing Error</AlertTitle>
              <AlertDescription>
                {result.error || "Failed to process the meter image. Please try again or enter readings manually."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowManualDialog(true)}
          >
            Enter Readings Manually
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center gap-2"
          >
            <Spinner size="xsmall" show={uploading} className="text-white" />
            {uploading ? "Processing..." : "Process Meter Reading"}
          </Button>
        </CardFooter>
      </Card>
      
      {renderBillDetails()}
      {renderManualReadingsDialog()}
    </div>
  );
};

export default EnhancedUploadImage;
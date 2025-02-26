/**
 * imageProcessor.js
 * Utility for processing meter reading images using OCR
 * Handles image upload, OCR processing, and data extraction
 */

const cloudinary = require("cloudinary").v2;
const { createWorker } = require("tesseract.js");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

/**
 * Process uploaded meter image and extract readings
 * @param {Object} imageFile - The uploaded image file
 * @param {String} meterId - The meter ID for reference
 * @returns {Promise<Object>} Extracted data and image URL
 */
const processMeterImage = async (imageFile, meterId) => {
  try {
    // 1. Save and optimize the image temporarily
    const optimizedImagePath = await optimizeImage(imageFile.path);

    // 2. Upload to Cloudinary for storage and get URL
    const uploadResult = await uploadToCloudinary(optimizedImagePath, meterId);

    // 3. Extract meter readings using OCR
    const extractedData = await extractMeterReadings(optimizedImagePath);

    // 4. Clean up temporary files
    cleanupTempFiles(optimizedImagePath);

    return {
      success: true,
      readings: extractedData,
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      uploadDate: new Date(),
    };
  } catch (error) {
    console.error("Error processing meter image:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Optimize uploaded image for better OCR results
 * @param {String} imagePath - Path to the uploaded image
 * @returns {Promise<String>} Path to the optimized image
 */
const optimizeImage = async (imagePath) => {
  const filename = path.basename(imagePath);
  const optimizedPath = path.join(
    path.dirname(imagePath),
    `optimized_${filename}`
  );

  await sharp(imagePath)
    .resize(1200, null, { withoutEnlargement: true }) // Resize to reasonable dimensions
    .modulate({ brightness: 1.1 }) // Slightly increase brightness
    .sharpen() // Sharpen the image
    .normalize() // Normalize the color range
    .toFile(optimizedPath);

  return optimizedPath;
};

/**
 * Upload processed image to Cloudinary
 * @param {String} imagePath - Path to the image file
 * @param {String} meterId - Meter ID for reference
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = async (imagePath, meterId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      imagePath,
      {
        folder: "meter_readings",
        resource_type: "image",
        public_id: `meter_${meterId}_${Date.now()}`,
        tags: ["meter_reading", meterId],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

/**
 * Extract meter readings using OCR
 * @param {String} imagePath - Path to the optimized image
 * @returns {Promise<Object>} Extracted readings data
 */
const extractMeterReadings = async (imagePath) => {
  const worker = await createWorker();

  try {
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    // Set parameters to improve meter reading recognition
    await worker.setParameters({
      tessedit_char_whitelist: "0123456789.",
      tessedit_pageseg_mode: "6", // Assume a single uniform block of text
    });

    // Recognize text from the image
    const { data } = await worker.recognize(imagePath);

    // Extract and process the readings
    const readings = processExtractedText(data.text);

    return readings;
  } finally {
    // Always terminate the worker to free resources
    await worker.terminate();
  }
};

/**
 * Process and normalize the extracted OCR text
 * @param {String} text - Raw text from OCR
 * @returns {Object} Structured readings data
 */
const processExtractedText = (text) => {
  // Clean up text: remove unwanted characters, normalize spaces
  const cleanedText = text
    .replace(/[^\d.\n\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Find numeric values that look like meter readings
  const numericValues = cleanedText.match(/\d+(\.\d+)?/g) || [];

  // Extract what appears to be the current reading
  // In a real implementation, this would be more sophisticated
  // based on the specific meter format
  const currentReading =
    numericValues.length > 0 ? parseFloat(numericValues[0]) : null;

  // Extract previous reading if available (usually the second number)
  const previousReading =
    numericValues.length > 1 ? parseFloat(numericValues[1]) : null;

  // Calculate consumption if both readings are available
  const consumption =
    currentReading !== null && previousReading !== null
      ? Math.max(0, currentReading - previousReading)
      : null;

  return {
    currentReading,
    previousReading,
    consumption,
    allExtractedValues: numericValues,
    rawText: text, // Keep raw text for debugging
  };
};

/**
 * Calculate bill based on meter readings and NUST-specific tariff structure
 * @param {Object} readings - The extracted meter readings
 * @param {Object} tariffRates - Current tariff rates configuration
 * @returns {Object} Calculated bill details
 */
const calculateBill = (readings, tariffRates) => {
  // Validate readings
  if (
    !readings.peakCurrent ||
    !readings.peakPrevious ||
    !readings.offPeakCurrent ||
    !readings.offPeakPrevious
  ) {
    return {
      success: false,
      error: "Unable to determine peak and off-peak readings",
    };
  }

  // Calculate peak and off-peak units consumed
  const peakUnits = readings.peakCurrent - readings.peakPrevious;
  const offPeakUnits = readings.offPeakCurrent - readings.offPeakPrevious;
  const totalUnits = peakUnits + offPeakUnits;

  if (totalUnits < 0) {
    return {
      success: false,
      error: "Invalid meter readings detected (negative consumption)",
    };
  }

  // 1. Calculate Electric Cost
  const electricCost =
    peakUnits * tariffRates.peakRate + offPeakUnits * tariffRates.offPeakRate;

  // 2. Calculate FC (Fuel Charge)
  const fuelCharge = totalUnits * tariffRates.fcRate;

  // 3. Calculate QTR (Quarterly Tax)
  const qtrTax = totalUnits * tariffRates.qtrRate;

  // 4. Apply fixed charges
  const fixedCharges = tariffRates.fixedCharges || 1000; // Default 1000 as per image

  // 5. Calculate FPA (Fuel Price Adjustment)
  const fpaCharge = totalUnits * tariffRates.fpaRate;

  // 6. Calculate ED (Electricity Duty) - only if in Rawalpindi region
  let electricityDuty = 0;
  if (tariffRates.isRawalpindiRegion) {
    electricityDuty = tariffRates.edRate || 0;
  }

  // 7. Calculate GST (18% on Electric Cost + FC + QTR)
  const subtotalForGST = electricCost + fuelCharge + qtrTax;
  const gstAmount = subtotalForGST * tariffRates.gstRate;

  // 8. Add other fixed fees
  const ptvFee = tariffRates.ptvFee || 35;
  const meterRent = tariffRates.meterRent || 25;
  const waterBill = tariffRates.waterBill || 250;

  // Calculate total amount
  const totalAmount =
    electricCost +
    fuelCharge +
    qtrTax +
    fixedCharges +
    fpaCharge +
    electricityDuty +
    gstAmount +
    ptvFee +
    meterRent +
    waterBill;

  return {
    success: true,
    billDetails: {
      meterReadings: {
        peak: {
          previous: readings.peakPrevious,
          current: readings.peakCurrent,
          units: peakUnits,
        },
        offPeak: {
          previous: readings.offPeakPrevious,
          current: readings.offPeakCurrent,
          units: offPeakUnits,
        },
        totalUnits: totalUnits,
      },
      charges: {
        electricCost: parseFloat(electricCost.toFixed(2)),
        fuelCharge: parseFloat(fuelCharge.toFixed(2)),
        qtrTax: parseFloat(qtrTax.toFixed(2)),
        fixedCharges: fixedCharges,
        fpaCharge: parseFloat(fpaCharge.toFixed(2)),
        electricityDuty: parseFloat(electricityDuty.toFixed(2)),
        gst: parseFloat(gstAmount.toFixed(2)),
        ptvFee: ptvFee,
        meterRent: meterRent,
        waterBill: waterBill,
      },
      tariffRates: {
        peakRate: tariffRates.peakRate,
        offPeakRate: tariffRates.offPeakRate,
        fcRate: tariffRates.fcRate,
        qtrRate: tariffRates.qtrRate,
        fpaRate: tariffRates.fpaRate,
        gstRate: tariffRates.gstRate,
      },
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      billingDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    },
  };
};

/**
 * Clean up temporary files created during processing
 * @param {String} filePath - Path to the temporary file
 */
const cleanupTempFiles = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error cleaning up temporary files:", error);
  }
};

module.exports = {
  processMeterImage,
  calculateBill,
};

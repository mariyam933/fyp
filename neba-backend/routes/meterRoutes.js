/**
 * meterRoutes.js
 * API routes for meter reading processing and bill calculations
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// const meterController = require("../controllers/meterController");
const { validateToken } = require("../middlewares/validateToken");

// Configure multer for meter image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/temp");

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `meter-${uniqueSuffix}${extension}`);
  },
});

// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/heic", "image/heif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPG, PNG, and HEIC images are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Routes
// Process meter reading image
// router.post(
//   "/process",
//   validateToken,
//   upload.single("meterImage"),
//   meterController.processMeterReadingImage
// );

// // Save processed bill
// router.post("/save-bill", validateToken, meterController.saveBill);

// // Get meter reading history
// router.get("/history/:meterId", validateToken, meterController.getMeterHistory);

// // Get current tariff rates
// router.get("/tariff-rates", validateToken, meterController.getTariffRates);

// // Update tariff rates (admin only)
// router.put("/tariff-rates", validateToken, meterController.updateTariffRates);

// // Process manual meter reading (when OCR fails)
// router.post(
//   "/manual-reading",
//   validateToken,
//   meterController.processManualReading
// );

// // Search meters by address or customer
// router.get("/search", validateToken, meterController.searchMeters);

module.exports = router;

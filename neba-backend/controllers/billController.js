const Bill = require("../models/Bill");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Settings = require("../models/Settings");
const PDFDocument = require("pdfkit");
const cloudinary = require("../config/cloudinaryConfig");
const path = require("path");
const fs = require("fs");

exports.createBill = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { customerId, meterSrNo, currentReading, imageFile } = req.body;

    if (
      !customerId ||
      currentReading == null ||
      isNaN(Number(currentReading))
    ) {
      return res
        .status(400)
        .json({ message: "Invalid customerId or currentReading" });
    }

    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const previousBill = await Bill.findOne({ customerId })
      .sort({ createdAt: -1 })
      .limit(1);

    const prevReading = previousBill ? Number(previousBill.unitsConsumed) : 0;

    const unitsConsumed = Number(currentReading) - prevReading;

    if (unitsConsumed < 0) {
      return res
        .status(400)
        .json({ message: "Current reading is less than previous reading" });
    }

    // Get unit price from settings
    const settings = await Settings.findOne();
    console.log("Settings found:", settings); // Debug log

    if (!settings) {
      console.log("No settings found, creating default settings"); // Debug log
      const defaultSettings = await Settings.create({ unitPrice: 35 });
      console.log("Default settings created:", defaultSettings); // Debug log
    }

    const unitPrice = settings ? settings.unitPrice : 35;
    console.log("Using unit price:", unitPrice); // Debug log
    console.log("Units consumed:", unitsConsumed); // Debug log

    const totalBill = Number(unitsConsumed) * Number(unitPrice);
    console.log("Total bill calculated:", totalBill); // Debug log

    let imageUrl = null;
    if (imageFile) {
      try {
        console.log("Uploading image to Cloudinary...");
        const uploadResult = await cloudinary.uploader.upload(imageFile, {
          folder: "bill_images",
          resource_type: "image",
          public_id: `bill_${meterSrNo}_${Date.now()}`,
          tags: ["bill", meterSrNo],
        });
        console.log("Cloudinary upload result:", uploadResult);
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return res.status(500).json({
          message: "Error uploading bill image",
          error: error.message,
        });
      }
    }

    const newBill = new Bill({
      customerId,
      meterSrNo,
      unitsConsumed,
      totalBill,
      imageUrl,
      isOcrProcessed: true,
    });

    await newBill.save();
    return res.status(201).json(newBill);
  } catch (error) {
    console.error("Error in createBill:", error);
    return res.status(500).json({
      message: "Error creating bill",
      error: error.message,
    });
  }
};

// Get all bills
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate("customerId", "name email"); // Populating customer data
    return res.status(200).json(bills);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching bills" });
  }
};

// Get bills by customer ID
exports.getBillsByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;

    const bills = await Bill.find({ customerId }).populate(
      "customerId",
      "name email"
    );

    if (!bills.length) {
      return res
        .status(404)
        .json({ message: "No bills found for this customer" });
    }

    return res.status(200).json(bills);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching bills for the customer" });
  }
};

// Get Previous Month Units
exports.getPreviousMonthUnits = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Ensure customerId is provided
    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    // Find the most recent bill for the customer
    const latestBill = await Bill.findOne({ customerId })
      .sort({ createdAt: -1 }) // Sort by most recent
      .limit(1);

    if (!latestBill) {
      return res
        .status(404)
        .json({ message: "No billing record found for this customer" });
    }

    return res.status(200).json({
      customerId,
      latestUnitsConsumed: latestBill.unitsConsumed, // Returning latest units consumed
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching latest units consumed" });
  }
};

// // Update a bill (example: you might want to update units consumed or total bill)
// exports.updateBill = async (req, res) => {
//   try {
//     const { billId } = req.params;
//     const { unitsConsumed, totalBill, meterSrNo } = req.body;

//     const updatedBill = await Bill.findByIdAndUpdate(
//       billId,
//       { unitsConsumed, totalBill, meterSrNo },
//       { new: true }
//     );

//     if (!updatedBill) {
//       return res.status(404).json({ message: "Bill not found" });
//     }

//     return res.status(200).json(updatedBill);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Error updating bill" });
//   }
// };

exports.updateBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const { unitsConsumed, meterSrNo } = req.body;

    // Find the bill to update
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Find the previous bill for this customer
    const previousBill = await Bill.findOne({ customerId: bill.customerId })
      .sort({ createdAt: -1 })
      .limit(1);

    // Get previous reading or set to 0 if no previous bill exists
    const prevReading = previousBill ? Number(previousBill.unitsConsumed) : 0;

    // Ensure valid subtraction
    if (unitsConsumed < prevReading) {
      return res.status(400).json({
        message:
          "New reading must be greater than or equal to the previous reading",
      });
    }

    // Calculate new total bill
    const totalBill = unitsConsumed * 35;

    // Update the bill
    const updatedBill = await Bill.findByIdAndUpdate(
      billId,
      { unitsConsumed, totalBill, meterSrNo },
      { new: true }
    );

    return res.status(200).json(updatedBill);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating bill" });
  }
};

// Delete a bill
exports.deleteBill = async (req, res) => {
  try {
    const { billId } = req.params;

    const deletedBill = await Bill.findByIdAndDelete(billId);

    if (!deletedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    return res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting bill" });
  }
};

exports.downloadBill = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId).populate("customerId", "name");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=bill_${bill.meterSrNo}.pdf`
    );

    doc.pipe(res);

    // Add signature image
    doc.image("public/images/01.png", 50, 50, { width: 100 });

    // Add meter image on the right
    if (bill.imageUrl) {
      doc.image(bill.imageUrl, 400, 50, { width: 150 });
    }

    // Add bill header
    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#0000FF") // Blue color
      .text("WATER BILL", { align: "center" })
      .moveDown();

    // Create a table for bill details
    const tableTop = 200;
    const tableLeft = 50;
    const tableWidth = 500;
    const rowHeight = 30;
    const cellPadding = 5;

    // Helper function to draw table cell
    const drawCell = (text, x, y, width, align = "left") => {
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor("#0000FF") // Blue color
        .text(text, x + cellPadding, y + cellPadding, {
          width: width - 2 * cellPadding,
          align: align,
        });
    };

    // Draw table header
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#FF0000") // Red color
      .text("Bill Details", tableLeft, tableTop)
      .moveDown();

    // Draw table rows
    const rows = [
      ["Bill Number:", bill.billNumber || bill._id],
      ["Customer Name:", bill.customerId.name],
      ["Meter Serial No:", bill.meterSrNo],
      ["Previous Reading:", bill.previousReading || "0"],
      ["Current Reading:", bill.currentReading || bill.unitsConsumed],
      ["Units Consumed:", bill.unitsConsumed],
      ["Unit Price:", `Rs. ${bill.unitPrice || 35}`],
      ["Total Amount:", `Rs. ${bill.totalBill}`],
      ["Due Date:", new Date(bill.dueDate || new Date()).toLocaleDateString()],
    ];

    rows.forEach((row, index) => {
      const y = tableTop + (index + 1) * rowHeight;

      // Draw cell borders
      doc
        .strokeColor("#0000FF") // Blue color
        .lineWidth(1)
        .rect(tableLeft, y, tableWidth, rowHeight)
        .stroke();

      // Draw cell content
      drawCell(row[0], tableLeft, y, 200);
      drawCell(row[1], tableLeft + 200, y, 300);
    });

    // Add payment status
    const statusY = tableTop + (rows.length + 1) * rowHeight;
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(bill.isPaid ? "#008000" : "#FF0000") // Green if paid, Red if unpaid
      .text(`Status: ${bill.isPaid ? "PAID" : "UNPAID"}`, tableLeft, statusY, {
        align: "center",
        width: tableWidth,
      });

    // Add footer with date
    const footerY = 700;
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#0000FF") // Blue color
      .text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        tableLeft,
        footerY,
        { align: "center", width: tableWidth }
      );

    doc.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error generating PDF" });
  }
};

const generateBillPDF = async (bill, customer) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  // Add signature image
  doc.image("public/images/01.png", 50, 50, { width: 100 });

  // Add meter image on the right
  if (bill.imageFile) {
    const imagePath = path.join(process.cwd(), "uploads", bill.imageFile);
    doc.image(imagePath, 400, 50, { width: 150 });
  }

  // Add bill header
  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#0000FF") // Blue color
    .text("WATER BILL", { align: "center" })
    .moveDown();

  // Create a table for bill details
  const tableTop = 200;
  const tableLeft = 50;
  const tableWidth = 500;
  const rowHeight = 30;
  const cellPadding = 5;

  // Helper function to draw table cell
  const drawCell = (text, x, y, width, align = "left") => {
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#0000FF") // Blue color
      .text(text, x + cellPadding, y + cellPadding, {
        width: width - 2 * cellPadding,
        align: align,
      });
  };

  // Draw table header
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#FF0000") // Red color
    .text("Bill Details", tableLeft, tableTop)
    .moveDown();

  // Draw table rows
  const rows = [
    ["Bill Number:", bill.billNumber],
    ["Customer Name:", customer.name],
    ["Meter Serial No:", bill.meterSrNo],
    ["Previous Reading:", bill.previousReading],
    ["Current Reading:", bill.currentReading],
    ["Units Consumed:", bill.unitsConsumed],
    ["Unit Price:", `Rs. ${bill.unitPrice}`],
    ["Total Amount:", `Rs. ${bill.totalBill}`],
    ["Due Date:", new Date(bill.dueDate).toLocaleDateString()],
  ];

  rows.forEach((row, index) => {
    const y = tableTop + (index + 1) * rowHeight;

    // Draw cell borders
    doc
      .strokeColor("#0000FF") // Blue color
      .lineWidth(1)
      .rect(tableLeft, y, tableWidth, rowHeight)
      .stroke();

    // Draw cell content
    drawCell(row[0], tableLeft, y, 200);
    drawCell(row[1], tableLeft + 200, y, 300);
  });

  // Add payment status
  const statusY = tableTop + (rows.length + 1) * rowHeight;
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(bill.isPaid ? "#008000" : "#FF0000") // Green if paid, Red if unpaid
    .text(`Status: ${bill.isPaid ? "PAID" : "UNPAID"}`, tableLeft, statusY, {
      align: "center",
      width: tableWidth,
    });

  // Add footer with date
  const footerY = 700;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#0000FF") // Blue color
    .text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      tableLeft,
      footerY,
      { align: "center", width: tableWidth }
    );

  return doc;
};

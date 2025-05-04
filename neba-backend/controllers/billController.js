const Bill = require("../models/Bill");
const User = require("../models/User");
const Customer = require("../models/Customer"); // Ensure to import the Customer model
const PDFDocument = require("pdfkit");
const cloudinary = require("../config/cloudinaryConfig");
const path = require("path");
const fs = require("fs");

// Create a new bill for a customer
exports.createBill = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { customerId, meterSrNo, currentReading, imageFile } = req.body;

    // Ensure customerId and currentReading are valid numbers
    if (
      !customerId ||
      currentReading == null ||
      isNaN(Number(currentReading))
    ) {
      return res
        .status(400)
        .json({ message: "Invalid customerId or currentReading" });
    }

    // Ensure the customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Find the previous bill for this customer
    const previousBill = await Bill.findOne({ customerId })
      .sort({ createdAt: -1 })
      .limit(1);

    // Get previous reading or set to 0 if no previous bill exists
    const prevReading = previousBill ? Number(previousBill.unitsConsumed) : 0;

    // Ensure valid subtraction
    const unitsConsumed = Number(currentReading) - prevReading;

    if (unitsConsumed < 0) {
      return res
        .status(400)
        .json({ message: "Current reading is less than previous reading" });
    }

    const totalBill = unitsConsumed * 35;

    // Handle image upload to Cloudinary if image is provided
    let imageUrl = null;
    if (imageFile) {
      try {
        console.log("Uploading image to Cloudinary...");
        // Upload image to Cloudinary
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

    // Create a new Bill
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

// exports.createBill = async (req, res) => {
//   try {
//     console.log(req.body , 'saddam');
//     const { customerId, unitsConsumed, totalBill, meterSrNo } = req.body;
//     console.log("The values",req.body)

//     // Ensure the customer exists
//     const customer = await User.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     // Create a new Bill
//     const newBill = new Bill({
//       customerId,
//       meterSrNo,
//       unitsConsumed,
//       totalBill
//     });

//     await newBill.save();
//     return res.status(201).json(newBill);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Error creating bill" });
//   }
// };

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

// Download bill as PDF
exports.downloadBill = async (req, res) => {
  try {
    const { billId } = req.params;

    // Find the bill
    const bill = await Bill.findById(billId).populate("customerId", "name");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=bill_${bill.meterSrNo}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(20).text("Electricity Bill", { align: "center" });
    doc.moveDown();

    // Bill Details
    doc.fontSize(12);
    doc.text(`Customer Name: ${bill.customerId.name}`);
    doc.text(`Meter Serial Number: ${bill.meterSrNo}`);
    doc.moveDown();

    // Consumption Details
    doc.text("Consumption Details:");
    doc.text(`Units Consumed: ${bill.unitsConsumed}`);
    doc.text(`Total Amount: Rs. ${bill.totalBill}`);
    doc.moveDown();

    // Billing Date
    doc.text(`Billing Date: ${new Date(bill.createdAt).toLocaleDateString()}`);

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error generating PDF" });
  }
};

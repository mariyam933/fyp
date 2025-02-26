const Bill = require("../models/Bill");
const Customer = require("../models/Customer"); // Ensure to import the Customer model

// Create a new bill for a customer
exports.createBill = async (req, res) => {
  try {
    console.log(req.body , 'saddam');
    const { customerId, unitsConsumed, totalBill, meterSrNo } = req.body;

    // Ensure the customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Create a new Bill
    const newBill = new Bill({
      customerId,
      meterSrNo,
      unitsConsumed,
      totalBill
    });

    await newBill.save();
    return res.status(201).json(newBill);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating bill" });
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

    const bills = await Bill.find({ customerId }).populate("customerId", "name email");

    if (!bills.length) {
      return res.status(404).json({ message: "No bills found for this customer" });
    }

    return res.status(200).json(bills);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching bills for the customer" });
  }
};

// Update a bill (example: you might want to update units consumed or total bill)
exports.updateBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const { unitsConsumed, totalBill, meterSrNo } = req.body;

    const updatedBill = await Bill.findByIdAndUpdate(
      billId,
      { unitsConsumed, totalBill, meterSrNo },
      { new: true }
    );

    if (!updatedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

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

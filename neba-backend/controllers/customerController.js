const { validationResult } = require("express-validator");
const Customer = require("../models/Customer");

// Utility function for handling validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true; // Indicate that an error occurred
  }
  return false; // Indicate no errors
};


// Create a new customer
exports.createCustomer = async (req, res) => {

  const { name, email, address, phone, meterNo } = req.body;
  if(!name || !email || !address || !phone || !meterNo) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    
    const customerExists = await Customer.findOne({ email });
    if (customerExists) {
      return res
        .status(409)
        .json({ message: "Customer with this email already exists" });
    }

    const newCustomer = new Customer({ name, email, address, phone, meterNo });
    await newCustomer.save();

    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  handleValidationErrors(req, res);

  const { name, email, address, phone, meterNo } = req.body;

  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Update fields
    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.address = address || customer.address;
    customer.phone = phone || customer.phone;
    customer.meterNo = meterNo || customer.meterNo;

    const updatedCustomer = await customer.save();
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await Customer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

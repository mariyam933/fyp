const Customer = require("../models/Customer");
const User= require("../models/User")
const MeterReader =require("../models/MeterReader")
const sendEmail = require("../utils/sendEmail"); 

exports.createMeterReader = async (req, res) => {
  const { name, email, address, phone } = req.body;

  if (!name || !email || !address || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const meterReaderExists = await User.findOne({ email });
    if (meterReaderExists) {
      return res.status(409).json({ message: "Meter Reader with this email already exists" });
    }

    const role = 3;
    const password = "12345678"; 
    const newMeterReader = new User({ name, email, address, phone, role, password });
    await newMeterReader.save();

    // Send email with credentials
    const emailText = `Dear ${name},\n\nYour meter reader account has been created successfully.\n\nYour Credentials:\nEmail: ${email}\nPassword: ${password}\n\nBest Regards,\nNEBA Billing`;

    await sendEmail(email, "Welcome as a Meter Reader!", emailText);

    res.status(201).json(newMeterReader);
  } catch (error) {
    console.error("Error creating meter reader:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Create a new meter reader 
// exports.createMeterReader = async (req, res) => {

//   const { name, email, address, phone } = req.body;
//   if(!name || !email || !address || !phone ) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
    
//     const MeterReaderExists = await User.findOne({ email });
//     if (MeterReaderExists) {
//       return res
//         .status(409)
//         .json({ message: "Meter Reader with this email already exists" });
//     }
//     const role =3;

//     const newMeterReader = new User({ name, email, address, phone,role});
//     await newMeterReader.save();

//     res.status(201).json(newMeterReader);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

//get All Meter Readers
exports.getAllMeterReader = async (req, res) => {
  try {
    const meterReader = await User.find({role:3});
    res.status(200).json(meterReader);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
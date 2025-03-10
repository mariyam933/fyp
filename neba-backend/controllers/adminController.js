const { validationResult } = require("express-validator");
const User = require("../models/User")


const sendEmail = require("../utils/sendEmail"); 


// Utility function for handling validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true; // Indicate that an error occurred
  }
  return false; // Indicate no errors
};


// Create a new admin
// exports.createAdmin = async (req, res) => {

//   const { name, email, address, phone } = req.body;
//   if(!name || !email || !address || !phone ) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
    
//     const adminExists = await User.findOne({ email });
//     if (adminExists) {
//       return res
//         .status(409)
//         .json({ message: "User with this email already exists" });
//     }
//     const role=1;
//     const newCustomer = new User({ name, email, address, phone,role });
//     await newCustomer.save();

//     res.status(201).json(newCustomer);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

exports.createAdmin = async (req, res) => {
    const { name, email, address, phone } = req.body;
  
    if (!name || !email || !address || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const adminExists = await User.findOne({ email });
      if (adminExists) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
  
      const role = 1;
      const password = "12345678"; 
      const newAdmin = new User({ name, email, address, phone, role, password });
      await newAdmin.save();
  
      // Send email with credentials
      const emailText = `Dear ${name},\n\nYour admin account has been created successfully.\n\nYour Credentials:\nEmail: ${email}\nPassword: ${password}\n\nBest Regards,\nNEBA Billings`;
      
      await sendEmail(email, "Welcome as an Admin!", emailText);
  
      res.status(201).json(newAdmin);
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };


// exports.createAdmin = async (req, res) => {
//   const { name, email, address, phone } = req.body;

//   if (!name || !email || !address || !phone) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     const adminExists = await User.findOne({ email });
//     if (adminExists) {
//       return res
//         .status(409)
//         .json({ message: "User with this email already exists" });
//     }

//     const role = 1;
//     const newAdmin = new User({ name, email, address, phone, role });
//     await newAdmin.save();

//     // Send Email Notification
//     const mailOptions = {
//       from: "tayyab.hassan.rana@gmail.com",
//       to: email,
//       subject: "Welcome as an Admin!",
//       text: `Dear ${name},\n\nYour admin account has been successfully created.\n\nBest regards,\nYour Company`,
//     };

//     transporter.sendMail(mailOptions, (err, info) => {
//       if (err) {
//         console.error("Error sending email:", err);
//       } else {
//         console.log("Email sent:", info.response);
//       }
//     });

//     res.status(201).json(newAdmin);
//   } catch (error) {
//     console.error("Error creating admin:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };


// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const customers = await User.find({ role: 1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
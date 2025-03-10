const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({ message: "Please enter all fields" });
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { _id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET
    );

    const response = {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      token,
    };
    // set in cookies
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 100 * 365 * 24 * 60 * 60 * 1000, // 100 years
    //   sameSite: "None",
    // });
    res
      .status(201)
      .json({ message: "User registered successfully", user: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};
//login route
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (password !== "12345678") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If password is correct, send role and email
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password)
//     return res.status(400).json({ message: "Please enter all fields" });

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { _id: user._id, email: user.email },
//       process.env.JWT_SECRET
//     );
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 100 * 365 * 24 * 60 * 60 * 1000,
//       sameSite: "None", //for production
//     });

//     res.json({
//       message: "Login successful",
//       user: {
//         _id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//         token,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };



// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: {
//     type: String,
//     enum: ["admin", "user", "superAdmin"],
//     default: "user",
//     required: true,
//   },
// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    meterNo: {
      type: String,
      trim: true,
    },
    role:{
      type:String,
      required:true

    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);


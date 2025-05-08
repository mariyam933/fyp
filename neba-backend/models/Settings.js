const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
  unitPrice: {
    type: Number,
    required: true,
    default: 35,
  },
  // Bill component rates
  fcRate: {
    type: Number,
    required: true,
    default: 3.23,
  },
  qtrRate: {
    type: Number,
    required: true,
    default: 0.5,
  },
  fpaRate: {
    type: Number,
    required: true,
    default: 0.1,
  },
  fixedCharges: {
    type: Number,
    required: true,
    default: 1000,
  },
  ptvFee: {
    type: Number,
    required: true,
    default: 35,
  },
  meterRent: {
    type: Number,
    required: true,
    default: 25,
  },
  waterBill: {
    type: Number,
    required: true,
    default: 250,
  },
  gstRate: {
    type: Number,
    required: true,
    default: 0.18,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Settings", SettingsSchema);

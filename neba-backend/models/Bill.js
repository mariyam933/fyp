const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BillSchema = new Schema({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  meterSrNo: {
    type: String,
    required: true,
  },
  // Original fields
  currentReading: {
    type: Number,
    required: true,
  },
  previousReading: {
    type: Number,
    required: true,
  },
  unitsConsumed: {
    type: Number,
    required: true,
  },
  totalBill: {
    type: Number,
    required: true,
  },
  // New fields for detailed meter readings
  meterReadings: {
    peak: {
      previous: Number,
      current: Number,
      units: Number,
    },
    offPeak: {
      previous: Number,
      current: Number,
      units: Number,
    },
    totalUnits: Number,
  },
  // Detailed charge breakdown
  charges: {
    electricCost: Number,
    fuelCharge: Number,
    qtrTax: Number,
    fixedCharges: Number,
    fpaCharge: Number,
    electricityDuty: Number,
    gst: Number,
    ptvFee: Number,
    meterRent: Number,
    waterBill: Number,
  },
  // Tariff rates used for calculation
  tariffRates: {
    peakRate: Number,
    offPeakRate: Number,
    fcRate: Number,
    qtrRate: Number,
    fpaRate: Number,
    gstRate: Number,
  },
  // Bill metadata
  status: {
    type: String,
    enum: ["pending", "paid", "overdue"],
    default: "pending",
  },
  dueDate: {
    type: Date,
    default: function () {
      // Set due date to 15 days from creation by default
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);
      return dueDate;
    },
  },
  // Image related fields
  imageUrl: String,
  isOcrProcessed: {
    type: Boolean,
    default: false,
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp on save
BillSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Bill", BillSchema);

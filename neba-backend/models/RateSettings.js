const mongoose = require("mongoose");

const rateSettingsSchema = new mongoose.Schema(
  {
    ratePerUnit: {
      type: Number,
      required: true,
      default: 35,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RateSettings", rateSettingsSchema);

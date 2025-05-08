const Settings = require("../models/Settings");

// Get current settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        unitPrice: 35,
        fcRate: 3.23,
        qtrRate: 0.5,
        fpaRate: 0.1,
        fixedCharges: 1000,
        ptvFee: 35,
        meterRent: 25,
        waterBill: 250,
        gstRate: 0.18,
      });
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error("Error in getSettings:", error);
    return res.status(500).json({
      message: "Error fetching settings",
      error: error.message,
    });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    const {
      unitPrice,
      fcRate,
      qtrRate,
      fpaRate,
      fixedCharges,
      ptvFee,
      meterRent,
      waterBill,
      gstRate,
    } = req.body;

    // Validate all numeric values
    const numericFields = {
      unitPrice,
      fcRate,
      qtrRate,
      fpaRate,
      fixedCharges,
      ptvFee,
      meterRent,
      waterBill,
      gstRate,
    };

    for (const [field, value] of Object.entries(numericFields)) {
      if (value !== undefined && (isNaN(Number(value)) || Number(value) < 0)) {
        return res.status(400).json({ message: `Invalid ${field}` });
      }
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        unitPrice: Number(unitPrice) || 35,
        fcRate: Number(fcRate) || 3.23,
        qtrRate: Number(qtrRate) || 0.5,
        fpaRate: Number(fpaRate) || 0.1,
        fixedCharges: Number(fixedCharges) || 1000,
        ptvFee: Number(ptvFee) || 35,
        meterRent: Number(meterRent) || 25,
        waterBill: Number(waterBill) || 250,
        gstRate: Number(gstRate) || 0.18,
      });
    } else {
      // Update only the fields that are provided
      if (unitPrice !== undefined) settings.unitPrice = Number(unitPrice);
      if (fcRate !== undefined) settings.fcRate = Number(fcRate);
      if (qtrRate !== undefined) settings.qtrRate = Number(qtrRate);
      if (fpaRate !== undefined) settings.fpaRate = Number(fpaRate);
      if (fixedCharges !== undefined)
        settings.fixedCharges = Number(fixedCharges);
      if (ptvFee !== undefined) settings.ptvFee = Number(ptvFee);
      if (meterRent !== undefined) settings.meterRent = Number(meterRent);
      if (waterBill !== undefined) settings.waterBill = Number(waterBill);
      if (gstRate !== undefined) settings.gstRate = Number(gstRate);

      settings.updatedAt = Date.now();
      await settings.save();
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error("Error in updateSettings:", error);
    return res.status(500).json({
      message: "Error updating settings",
      error: error.message,
    });
  }
};

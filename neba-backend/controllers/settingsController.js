const Settings = require("../models/Settings");

// Get current settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({ unitPrice: 35 });
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

// Update unit price
exports.updateUnitPrice = async (req, res) => {
  try {
    const { unitPrice } = req.body;

    if (!unitPrice || isNaN(Number(unitPrice)) || Number(unitPrice) <= 0) {
      return res.status(400).json({ message: "Invalid unit price" });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({ unitPrice: Number(unitPrice) });
    } else {
      settings.unitPrice = Number(unitPrice);
      settings.updatedAt = Date.now();
      await settings.save();
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error("Error in updateUnitPrice:", error);
    return res.status(500).json({
      message: "Error updating unit price",
      error: error.message,
    });
  }
};

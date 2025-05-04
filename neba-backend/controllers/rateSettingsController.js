const RateSettings = require("../models/RateSettings");

exports.getRateSettings = async (req, res) => {
  try {
    const settings = await RateSettings.findOne().sort({ createdAt: -1 });
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await RateSettings.create({
        ratePerUnit: 35,
        updatedBy: req.user._id,
      });
      return res.status(200).json(defaultSettings);
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRateSettings = async (req, res) => {
  try {
    const { ratePerUnit } = req.body;
    if (!ratePerUnit || ratePerUnit <= 0) {
      return res.status(400).json({ message: "Invalid rate per unit" });
    }

    const settings = await RateSettings.create({
      ratePerUnit,
      updatedBy: req.user._id,
    });

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

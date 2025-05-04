const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getRateSettings,
  updateRateSettings,
} = require("../controllers/rateSettingsController");

router
  .route("/")
  .get(protect, getRateSettings)
  .put(protect, admin, updateRateSettings);

module.exports = router;

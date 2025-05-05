const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");

// Get current settings
router.get("/", settingsController.getSettings);

// Update unit price
router.put("/unit-price", settingsController.updateUnitPrice);

module.exports = router;

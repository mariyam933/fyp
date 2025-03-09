const express = require("express");
const { body } = require("express-validator");
// const {
//   createCustomer,
//   getAllCustomers,
//   getCustomerById,
//   updateCustomer,
//   deleteCustomer,
// } = require("../controllers/customerController.js");
const {
    createMeterReader,
    getAllMeterReader
}=require("../controllers/meterReaderController")

const router = express.Router();

// Routes
router.post("/", createMeterReader);
router.get("/", getAllMeterReader);
// router.get("/:id", getCustomerById);
// router.put("/:id", updateCustomer);
// router.delete("/:id", deleteCustomer);

module.exports = router;

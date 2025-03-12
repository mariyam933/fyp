const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");

// Route to create a new bill
router.post("/", billController.createBill);

// Route to get all bills
router.get("/", billController.getBills);

router.get("/prev/:customerId", billController.getPreviousMonthUnits);


// Route to get bills by customer ID
router.get("/:customerId", billController.getBillsByCustomerId);

// Route to update a bill
router.put("/:billId", billController.updateBill);

// Route to delete a bill
router.delete("/:billId", billController.deleteBill);

module.exports = router;

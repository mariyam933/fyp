const express = require("express");
const { body } = require("express-validator");
const {
  createAdmin,
  getAllAdmins,
//   getCustomerById,
//   updateCustomer,
//   deleteCustomer,
} = require("../controllers/adminController");

const router = express.Router();

// Routes
router.post("/", createAdmin);
router.get("/", getAllAdmins);
// router.get("/:id", getCustomerById);
// router.put("/:id", updateCustomer);
// router.delete("/:id", deleteCustomer);

module.exports = router;
